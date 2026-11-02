
const { parse } = require("csv-parse/sync");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const ImportJob = require("../models/ImportJob");
const AppError = require("../utils/AppError");

const COLUMNAS_OBLIGATORIAS = [
  "sku", "name", "category", "quantity", "price"
];

const MAPA_COLUMNAS = {
  sku: "sku",
  name: "name",
  category: "category",
  quantity: "quantity",
  price: "price",
  cost: "cost",
  minstock: "minStock",
  brand: "brand",
  model: "model",
  description: "description",
  supplier: "supplier",
  status: "status"
};

const CAMPOS_NUMERICOS = ["quantity", "price", "cost", "minStock"];
const MAX_ERRORES_GUARDADOS = 500;

function detectarSeparador(buffer) {
  const cabecera = buffer.toString("utf8").split(/\r?\n/)[0];
  const puntoYComa = (cabecera.match(/;/g) || []).length;
  const comas = (cabecera.match(/,/g) || []).length;

  return puntoYComa > comas ? ";" : ",";
}

function leerCsv(buffer) {
  try {
    return parse(buffer, {
      columns: (cabeceras) =>
        cabeceras.map((c) => c.trim().toLowerCase()),
      delimiter: detectarSeparador(buffer),
      bom: true,
      trim: true,
      skip_empty_lines: true
    });
  } catch (error) {
    throw new AppError(
      `El CSV no tiene un formato válido: ${error.message}`,
      400
    );
  }
}

function validarColumnas(filas) {
  if (filas.length === 0) {
    throw new AppError("El CSV no contiene filas de datos", 400);
  }

  const columnas = Object.keys(filas[0]);
  const faltan = COLUMNAS_OBLIGATORIAS.filter(
    (c) => !columnas.includes(c)
  );

  if (faltan.length > 0) {
    throw new AppError(
      `Faltan columnas obligatorias: ${faltan.join(", ")}`,
      400
    );
  }
}

function aNumero(valor) {
  if (valor === undefined || valor === "") return undefined;

  const texto = String(valor).replace(",", ".");

  return /^-?\d+(\.\d+)?$/.test(texto)
    ? Number(texto)
    : NaN;
}

async function procesarFilas(
  filas,
  { skusExistentes, proveedoresActivos }
) {
  const validos = [];
  const errores = [];
  const skusEnArchivo = new Set();

  for (const [indice, fila] of filas.entries()) {
    const numeroFila = indice + 2;
    const sku = (fila.sku || "").toUpperCase();

    const fallo = (message) =>
      errores.push({ row: numeroFila, sku, message });

    const producto = {};

    for (const [columna, campo] of Object.entries(MAPA_COLUMNAS)) {
      if (fila[columna] !== undefined && fila[columna] !== "") {
        producto[campo] = fila[columna];
      }
    }

    if (!producto.status) {
      producto.status = "active";
    }

    const vacios = COLUMNAS_OBLIGATORIAS.filter(
      (c) => !fila[c]
    );

    if (vacios.length > 0) {
      fallo(`Campos vacíos: ${vacios.join(", ")}`);
      continue;
    }

    const noNumerico = CAMPOS_NUMERICOS.find(
      (campo) =>
        producto[campo] !== undefined &&
        Number.isNaN(aNumero(producto[campo]))
    );

    if (noNumerico) {
      fallo(`"${noNumerico}" debe ser un número`);
      continue;
    }

    for (const campo of CAMPOS_NUMERICOS) {
      if (producto[campo] !== undefined) {
        producto[campo] = aNumero(producto[campo]);
      }
    }

    if (!Number.isInteger(producto.quantity)) {
      fallo('"quantity" debe ser un número entero');
      continue;
    }

    if (producto.quantity < 1) {
      fallo("Un producto nuevo debe tener al menos 1 unidad en stock");
      continue;
    }

    if (skusEnArchivo.has(sku)) {
      fallo("SKU repetido dentro del archivo");
      continue;
    }

    if (skusExistentes.has(sku)) {
      fallo("Ya existe un producto con ese SKU");
      continue;
    }

    // El proveedor es opcional en CSV.
    // Si no existe o está inactivo, el producto queda pendiente.
    let pendienteProveedor = false;

    if (producto.supplier) {
      const proveedor = proveedoresActivos.get(
        producto.supplier.toLowerCase()
      );

      if (proveedor) {
        producto.supplier = proveedor.name;
        producto.supplierRef = proveedor._id;
      } else {
        producto.supplier = "";
        producto.supplierRef = null;
        pendienteProveedor = true;
      }
    } else {
      producto.supplier = "";
      producto.supplierRef = null;
      pendienteProveedor = true;
    }

    try {
      await new Product(producto).validate();
    } catch (errorValidacion) {
      const mensajes = Object.values(
        errorValidacion.errors || {}
      ).map((e) => e.message);

      fallo(mensajes.join("; ") || errorValidacion.message);
      continue;
    }

    skusEnArchivo.add(sku);

    validos.push({
      row: numeroFila,
      sku,
      producto,
      pendienteProveedor
    });
  }

  return { validos, errores };
}

function calcularEstado(insertadas, conError) {
  if (conError === 0) return "completed";
  if (insertadas === 0) return "failed";
  return "partial";
}

async function importarProductos(archivo, usuarioId) {
  const filas = leerCsv(archivo.buffer);
  validarColumnas(filas);

  const skus = filas
    .map((f) => (f.sku || "").toUpperCase())
    .filter(Boolean);

  const existentes = await Product.find(
    { sku: { $in: skus } },
    "sku"
  ).lean();

  const proveedores = await Supplier.find(
    { active: true },
    "name"
  ).lean();

  const { validos, errores } = await procesarFilas(filas, {
    skusExistentes: new Set(existentes.map((p) => p.sku)),
    proveedoresActivos: new Map(
      proveedores.map((p) => [
        p.name.toLowerCase(),
        p
      ])
    )
  });

  let insertadas = 0;
  const pendientes = [];

  for (const {
    row,
    sku,
    producto,
    pendienteProveedor
  } of validos) {
    try {
      const creado = await Product.create(producto);
      insertadas++;

      if (pendienteProveedor) {
        pendientes.push({
          product: creado._id,
          sku: creado.sku,
          name: creado.name
        });
      }
    } catch (error) {
      const message =
        error.code === 11000
          ? "Ya existe un producto con ese SKU"
          : error.message;

      errores.push({ row, sku, message });
    }
  }

  errores.sort((a, b) => a.row - b.row);

  return ImportJob.create({
    fileName: archivo.originalname,
    user: usuarioId,
    status: calcularEstado(insertadas, errores.length),
    totalRows: filas.length,
    insertedRows: insertadas,
    errorRows: errores.length,
    rowErrors: errores.slice(0, MAX_ERRORES_GUARDADOS),
    pendingSupplierProducts: pendientes
  });
}

async function listar() {
  return ImportJob.find()
    .select("-rowErrors")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
}

async function buscarPorId(id) {
  return ImportJob.findById(id)
    .populate("user", "name email");
}


async function listarProveedoresPendientes(id) {
  const job = await ImportJob.findById(id)
    .populate("pendingSupplierProducts.product", "name sku")
    .lean();

  if (!job) {
    throw new AppError("Importación no encontrada", 404);
  }

  const proveedores = await Supplier.find(
    { active: true },
    "name"
  ).sort({ name: 1 }).lean();

  return {
    productos: job.pendingSupplierProducts,
    proveedores
  };
}

async function asignarProveedores(id, asignaciones) {
  const job = await ImportJob.findById(id);

  if (!job) {
    throw new AppError("Importación no encontrada", 404);
  }

  if (!Array.isArray(asignaciones) || asignaciones.length === 0) {
    throw new AppError("Debes indicar las asignaciones", 400);
  }

  const pendientes = job.pendingSupplierProducts;
  const productosUnicos = new Set();

  // Validar todas las asignaciones antes de modificar productos.
  for (const asignacion of asignaciones) {
    const { productId, supplierId } = asignacion;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Identificador de producto no válido", 400);
    }

    if (productosUnicos.has(productId)) {
      throw new AppError("No puedes asignar dos veces el mismo producto", 400);
    }

    productosUnicos.add(productId);

    const pendiente = pendientes.find(
      p => p.product.toString() === productId
    );

    if (!pendiente) {
      throw new AppError(
        `El producto ${productId} no está pendiente en esta importación`,
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      throw new AppError("Identificador de proveedor no válido", 400);
    }

    const proveedor = await Supplier.findOne({
      _id: supplierId,
      active: true
    });

    if (!proveedor) {
      throw new AppError("El proveedor no existe o está inactivo", 400);
    }

    asignacion.proveedor = proveedor;
  }

  // Comprobar que todos los productos siguen existiendo.
  for (const asignacion of asignaciones) {
    const producto = await Product.findById(asignacion.productId);

    if (!producto) {
      throw new AppError(
        `El producto ${asignacion.productId} ya no existe`,
        404
      );
    }
  }

  // Aplicar las asignaciones.
  for (const asignacion of asignaciones) {
    await Product.findByIdAndUpdate(
      asignacion.productId,
      {
        supplierRef: asignacion.proveedor._id,
        supplier: asignacion.proveedor.name
      },
      { runValidators: true }
    );
  }

  const idsAsignados = new Set(
    asignaciones.map(a => a.productId)
  );

  job.pendingSupplierProducts =
    job.pendingSupplierProducts.filter(
      p => !idsAsignados.has(p.product.toString())
    );

  await job.save();

  return {
    mensaje: "Proveedores asignados correctamente",
    pendientesRestantes: job.pendingSupplierProducts.length
  };
}

// VALIDAR ID DE MONGODB
function esIdValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  leerCsv,
  validarColumnas,
  procesarFilas,
  calcularEstado,
  importarProductos,
  listar,
  buscarPorId,
  esIdValido,
  listarProveedoresPendientes,
  asignarProveedores
};
