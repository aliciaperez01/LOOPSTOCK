const { parse } = require("csv-parse/sync");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const ImportJob = require("../models/ImportJob");
const AppError = require("../utils/AppError");

const COLUMNAS_OBLIGATORIAS = ["sku", "name", "category", "quantity", "price"];

// Cabecera del CSV (en minúsculas) -> campo del modelo Product
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

// Excel en español guarda con ";" (y usa "," para decimales): se detecta por la cabecera
function detectarSeparador(buffer) {
  const cabecera = buffer.toString("utf8").split(/\r?\n/)[0];
  const puntoYComa = (cabecera.match(/;/g) || []).length;
  const comas = (cabecera.match(/,/g) || []).length;
  return puntoYComa > comas ? ";" : ",";
}

// 1. Leer el CSV (separador "," o ";", y BOM de Excel)
function leerCsv(buffer) {
  try {
    return parse(buffer, {
      columns: (cabeceras) => cabeceras.map((c) => c.trim().toLowerCase()),
      delimiter: detectarSeparador(buffer),
      bom: true,
      trim: true,
      skip_empty_lines: true
    });
  } catch (error) {
    throw new AppError(`El CSV no tiene un formato válido: ${error.message}`, 400);
  }
}

// 2. Comprobar la estructura: columnas obligatorias presentes
function validarColumnas(filas) {
  if (filas.length === 0) {
    throw new AppError("El CSV no contiene filas de datos", 400);
  }
  const columnas = Object.keys(filas[0]);
  const faltan = COLUMNAS_OBLIGATORIAS.filter((c) => !columnas.includes(c));
  if (faltan.length > 0) {
    throw new AppError(`Faltan columnas obligatorias: ${faltan.join(", ")}`, 400);
  }
}

// Convierte "12,50" o "12.50" en número; devuelve NaN si no es válido
function aNumero(valor) {
  if (valor === undefined || valor === "") return undefined;
  const texto = String(valor).replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(texto) ? Number(texto) : NaN;
}

// 3. Validar cada fila (función pura: no consulta la base de datos)
async function procesarFilas(filas, { skusExistentes, proveedoresActivos }) {
  const validos = [];
  const errores = [];
  const skusEnArchivo = new Set();

  for (const [indice, fila] of filas.entries()) {
    const numeroFila = indice + 2; // +1 por la cabecera, +1 porque se cuenta desde 1
    const sku = (fila.sku || "").toUpperCase();
    const fallo = (message) => errores.push({ row: numeroFila, sku, message });

    // Construir el producto solo con las columnas conocidas
    const producto = {};
    for (const [columna, campo] of Object.entries(MAPA_COLUMNAS)) {
      if (fila[columna] !== undefined && fila[columna] !== "") {
        producto[campo] = fila[columna];
      }
    }

    // Obligatorios con valor
    const vacios = COLUMNAS_OBLIGATORIAS.filter((c) => !fila[c]);
    if (vacios.length > 0) { fallo(`Campos vacíos: ${vacios.join(", ")}`); continue; }

    // Tipos numéricos
    const noNumerico = CAMPOS_NUMERICOS.find(
      (campo) => producto[campo] !== undefined && Number.isNaN(aNumero(producto[campo]))
    );
    if (noNumerico) { fallo(`"${noNumerico}" debe ser un número`); continue; }
    for (const campo of CAMPOS_NUMERICOS) {
      if (producto[campo] !== undefined) producto[campo] = aNumero(producto[campo]);
    }
    if (!Number.isInteger(producto.quantity)) { fallo('"quantity" debe ser un número entero'); continue; }
    if (producto.quantity < 1) { fallo("Un producto nuevo debe tener al menos 1 unidad en stock"); continue; }

    // Duplicados: dentro del archivo y contra la base de datos
    if (skusEnArchivo.has(sku)) { fallo("SKU repetido dentro del archivo"); continue; }
    if (skusExistentes.has(sku)) { fallo("Ya existe un producto con ese SKU"); continue; }

    // Proveedor: si se indica, debe existir y estar activo
    if (producto.supplier) {
      const nombreReal = proveedoresActivos.get(producto.supplier.toLowerCase());
      if (!nombreReal) { fallo(`El proveedor "${producto.supplier}" no existe o está inactivo`); continue; }
      producto.supplier = nombreReal;
    }

    // Reglas del esquema de Ali (mínimos, enum de status...)
    try {
      await new Product(producto).validate();
    } catch (errorValidacion) {
      const mensajes = Object.values(errorValidacion.errors || {}).map((e) => e.message);
      fallo(mensajes.join("; ") || errorValidacion.message);
      continue;
    }

    skusEnArchivo.add(sku);
    validos.push({ row: numeroFila, sku, producto });
  }

  return { validos, errores };
}

function calcularEstado(insertadas, conError) {
  if (conError === 0) return "completed";
  if (insertadas === 0) return "failed";
  return "partial";
}

// 4. Proceso completo: leer, validar, insertar y registrar el ImportJob
async function importarProductos(archivo, usuarioId) {
  const filas = leerCsv(archivo.buffer);
  validarColumnas(filas);

  // Una sola consulta para SKUs existentes y otra para proveedores activos
  const skus = filas.map((f) => (f.sku || "").toUpperCase()).filter(Boolean);
  const existentes = await Product.find({ sku: { $in: skus } }, "sku").lean();
  const proveedores = await Supplier.find({ active: true }, "name").lean();

  const { validos, errores } = await procesarFilas(filas, {
    skusExistentes: new Set(existentes.map((p) => p.sku)),
    proveedoresActivos: new Map(proveedores.map((p) => [p.name.toLowerCase(), p.name]))
  });

  // Inserción fila a fila: un fallo no detiene al resto (importación parcial)
  let insertadas = 0;
  for (const { row, sku, producto } of validos) {
    try {
      await Product.create(producto);
      insertadas++;
    } catch (error) {
      const message =
        error.code === 11000 ? "Ya existe un producto con ese SKU" : error.message;
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
    rowErrors: errores.slice(0, MAX_ERRORES_GUARDADOS)
  });
}

async function listar() {
  return ImportJob.find()
    .select("-rowErrors")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
}

async function buscarPorId(id) {
  return ImportJob.findById(id).populate("user", "name email");
}

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
  esIdValido
};
