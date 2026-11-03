require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const Supplier = require("../src/models/Supplier");

const PROVEEDORES_OBJETIVO = [
  "THOMANN",
  "Elektron",
  "Roland",
  "AlphaTheta",
  "Native Instruments"
];

const PROVEEDORES_DESACTIVAR = [
  "ADAM",
  "Pioneer DJ",
  "Borja"
];

const COLLATION = { locale: "es", strength: 2 };

function normalizar(valor) {
  return String(valor || "").trim().toLowerCase();
}

function clasificar(producto) {
  const supplier = normalizar(producto.supplier);
  const brand = normalizar(producto.brand);
  const name = normalizar(producto.name);
  const sku = normalizar(producto.sku);

  // Todos los productos Pioneer DJ pasan a AlphaTheta.
  if (
    supplier === "pioneer dj" ||
    brand === "pioneer dj" ||
    name.includes("pioneer dj") ||
    sku.startsWith("dj-pio-") ||
    sku.startsWith("mix-pio-") ||
    ["hdj-x5", "ddj-flx4", "xdj-rx3"].includes(sku)
  ) {
    return "AlphaTheta";
  }

  if (supplier === "elektron" || brand === "elektron") {
    return "Elektron";
  }

  if (supplier === "roland" || brand === "roland") {
    return "Roland";
  }

  if (
    supplier === "native instruments" ||
    brand === "native instruments"
  ) {
    return "Native Instruments";
  }

  // El resto, incluido Mini-borja x3, pasa a THOMANN.
  return "THOMANN";
}

async function buscarProveedor(nombre, session) {
  return Supplier.findOne({ name: nombre })
    .collation(COLLATION)
    .session(session || null);
}

async function main() {
  const aplicar = process.argv.includes("--apply");

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "loopstock"
  });

  const session = await mongoose.startSession();

  try {
    const ejecutar = async () => {
      const productos = await Product.find({}).session(session);
      const proveedores = await Supplier.find({}).session(session);

      if (productos.length !== 42) {
        throw new Error(
          `Se esperaban 42 productos, pero hay ${productos.length}. Se cancela.`
        );
      }

      const thomann = await buscarProveedor("THOMANN", session);

      if (!thomann) {
        throw new Error("No existe THOMANN. Se cancela la migración.");
      }

      const asignaciones = new Map();
      const resumen = {};

      for (const nombre of PROVEEDORES_OBJETIVO) {
        asignaciones.set(nombre, []);
        resumen[nombre] = 0;
      }

      for (const producto of productos) {
        const destino = clasificar(producto);
        asignaciones.get(destino).push(producto);
        resumen[destino]++;
      }

      // Comprobaciones previas.
      const skus = productos.map(p => p.sku);
      if (new Set(skus).size !== skus.length) {
        throw new Error("Hay SKU duplicados. Se cancela la migración.");
      }

      console.log("\nBASE DE DATOS:", mongoose.connection.name);
      console.log("MODO:", aplicar ? "APLICAR CAMBIOS" : "SIMULACIÓN");
      console.log("\nASIGNACIÓN PROPUESTA:");

      for (const nombre of PROVEEDORES_OBJETIVO) {
        console.log(`\n${nombre}: ${resumen[nombre]} productos`);

        for (const producto of asignaciones.get(nombre)) {
          console.log(`  ${producto.sku} | ${producto.name}`);
        }
      }

      console.log("\nPROVEEDORES ACTUALES:");
      for (const proveedor of proveedores) {
        console.log(
          `  ${proveedor.name} | ${proveedor.active ? "activo" : "inactivo"}`
        );
      }

      if (!aplicar) {
        console.log(
          "\nSIMULACIÓN: no se ha modificado ningún dato."
        );
        return;
      }

      // Crear proveedores que falten y activar los cinco definitivos.
      const proveedoresDestino = {};

      for (const nombre of PROVEEDORES_OBJETIVO) {
        let proveedor = await buscarProveedor(nombre, session);

        if (!proveedor) {
          proveedor = new Supplier({ name: nombre, active: true });
          await proveedor.save({ session });
          console.log("Proveedor creado:", nombre);
        } else {
          proveedor.active = true;
          await proveedor.save({ session });
          console.log("Proveedor conservado/activado:", nombre);
        }

        proveedoresDestino[nombre] = proveedor;
      }

      // Actualizar únicamente supplier y supplierRef.
      for (const nombre of PROVEEDORES_OBJETIVO) {
        const proveedor = proveedoresDestino[nombre];

        for (const producto of asignaciones.get(nombre)) {
          producto.supplier = proveedor.name;
          producto.supplierRef = proveedor._id;
          await producto.save({ session });
        }
      }

      // Desactivar los proveedores que ya no se utilizarán.
      for (const nombre of PROVEEDORES_DESACTIVAR) {
        const proveedor = await buscarProveedor(nombre, session);

        if (proveedor) {
          proveedor.active = false;
          await proveedor.save({ session });
          console.log("Proveedor desactivado:", nombre);
        }
      }

      // Verificación dentro de la transacción.
      const productosFinales = await Product.find({}).session(session);
      const proveedoresFinales = await Supplier.find({}).session(session);

      const sinReferencia = productosFinales.filter(p => !p.supplierRef);
      if (sinReferencia.length > 0) {
        throw new Error(
          `Quedan ${sinReferencia.length} productos sin proveedor.`
        );
      }

      for (const producto of productosFinales) {
        const proveedor = await Supplier.findById(producto.supplierRef)
          .session(session);

        if (
          !proveedor ||
          !proveedor.active ||
          proveedor.name !== producto.supplier
        ) {
          throw new Error(
            `Referencia incorrecta en el producto ${producto.sku}.`
          );
        }
      }

      const activos = proveedoresFinales
        .filter(p => p.active)
        .map(p => p.name)
        .sort();

      const esperados = [...PROVEEDORES_OBJETIVO].sort();

      if (
        JSON.stringify(activos) !== JSON.stringify(esperados)
      ) {
        throw new Error(
          "Los proveedores activos finales no coinciden con los esperados."
        );
      }

      console.log("\nVERIFICACIÓN CORRECTA:");
      console.log("Productos revisados:", productosFinales.length);
      console.log("Productos sin proveedor:", sinReferencia.length);
      console.log("Proveedores activos:", activos.join(", "));
    };

    if (aplicar) {
      await session.withTransaction(ejecutar);
      console.log("\nMIGRACIÓN CONFIRMADA.");
    } else {
      await ejecutar();
    }
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error("\nERROR:", error.message);
  process.exitCode = 1;
});
