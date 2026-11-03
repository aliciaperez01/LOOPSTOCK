
const mongoose = require("mongoose");
const Product = require("../models/Product.js");
const Supplier = require("../models/Supplier.js");

// VALIDAR PROVEEDOR ACTIVO
async function obtenerProveedorActivo(supplierRef) {
  if (!supplierRef || !mongoose.isValidObjectId(supplierRef)) {
    const error = new Error("Debes seleccionar un proveedor válido.");
    error.status = 400;
    throw error;
  }

  const proveedor = await Supplier.findOne({
    _id: supplierRef,
    active: true
  });

  if (!proveedor) {
    const error = new Error("El proveedor no existe o está inactivo.");
    error.status = 400;
    throw error;
  }

  return proveedor;
}

// LISTAR, BUSCAR, FILTRAR Y PAGINAR PRODUCTOS
async function listar(filtros = {}) {
  const filtro = {};

  // FILTRAR POR CATEGORÍA
  if (filtros.category) {
    filtro.category = filtros.category;
  }

  // FILTRAR POR ESTADO DEL PRODUCTO
if (["active", "inactive"].includes(filtros.status)) {
  filtro.status = filtros.status;
} else {
  // Por defecto, mostrar solo productos activos.
  // También incluye productos antiguos sin campo status.
  filtro.status = { $ne: "inactive" };
}

  // BUSCAR POR NOMBRE, SKU, CATEGORÍA O PROVEEDOR
  if (filtros.search) {
    const busqueda = filtros.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filtro.$or = [
      { name: { $regex: busqueda, $options: "i" } },
      { sku: { $regex: busqueda, $options: "i" } },
      { category: { $regex: busqueda, $options: "i" } },
      { supplier: { $regex: busqueda, $options: "i" } }
    ];
  }

  // FILTRAR POR ESTADO DEL STOCK
  if (filtros.stock === "available") {
    filtro.$expr = {
      $gt: ["$quantity", "$minStock"]
    };
  }

  if (filtros.stock === "low") {
    filtro.$expr = {
      $and: [
        { $gt: ["$quantity", 0] },
        { $lte: ["$quantity", "$minStock"] }
      ]
    };
  }

  if (filtros.stock === "out") {
    filtro.quantity = { $lte: 0 };
  }

  // COMPATIBILIDAD CON LA RUTA DE PRODUCTOS CON STOCK BAJO
  if (filtros.lowStock === true) {
    filtro.$expr = {
      $lte: ["$quantity", "$minStock"]
    };
  }

  // PAGINACIÓN
  const page = Math.max(
    1,
    Number.parseInt(filtros.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(filtros.limit, 10) || 10)
  );

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filtro)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filtro)
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}

// OBTENER ESTADÍSTICAS GENERALES DEL INVENTARIO
async function obtenerEstadisticas() {
  const resultado = await Product.aggregate([
    {
      $group: {
        _id: null,

        totalProducts: {
          $sum: 1
        },

        totalUnits: {
          $sum: {
            $max: [
              0,
              { $ifNull: ["$quantity", 0] }
            ]
          }
        },

        inventoryValue: {
          $sum: {
            $multiply: [
              {
                $max: [
                  0,
                  { $ifNull: ["$quantity", 0] }
                ]
              },
              {
                $max: [
                  0,
                  { $ifNull: ["$price", 0] }
                ]
              }
            ]
          }
        },

        lowStock: {
          $sum: {
            $cond: [
              {
                $lte: [
                  { $ifNull: ["$quantity", 0] },
                  { $ifNull: ["$minStock", 0] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return resultado[0] || {
    totalProducts: 0,
    totalUnits: 0,
    inventoryValue: 0,
    lowStock: 0
  };
}

// OBTENER TODAS LAS CATEGORÍAS
async function obtenerCategorias() {
  return Product.distinct("category");
}

// BUSCAR POR ID
async function buscarPorId(id) {
  return Product.findById(id);
}

// CREAR PRODUCTO
async function crear(datos) {
  const cantidad = datos.quantity;

  if (
    cantidad === undefined ||
    cantidad === null ||
    cantidad === "" ||
    !Number.isFinite(Number(cantidad)) ||
    Number(cantidad) < 1
  ) {
    const error = new Error(
      "Un producto nuevo debe tener al menos 1 unidad en stock"
    );

    error.status = 400;
    throw error;
  }

  const proveedor = await obtenerProveedorActivo(datos.supplierRef);

  return Product.create({
    ...datos,
    supplierRef: proveedor._id,
    supplier: proveedor.name
  });
}

// ACTUALIZAR PRODUCTO
async function actualizar(id, datos) {
  const proveedor = await obtenerProveedorActivo(datos.supplierRef);

  return Product.findByIdAndUpdate(
    id,
    {
      ...datos,
      supplierRef: proveedor._id,
      supplier: proveedor.name
    },
    {
      returnDocument: "after",
      runValidators: true,
      upsert: false
    }
  );
}

// BAJA LÓGICA DE PRODUCTOS
async function eliminar(id) {
  return Product.findByIdAndUpdate(
    id,
    { status: "inactive" },
    {
      returnDocument: "after",
      runValidators: true,
      upsert: false
    }
  );
}

// VALIDAR ID
function esIdValido(id) {
  return mongoose.isValidObjectId(id);
}

// EXPORTAR FUNCIONES
module.exports = {
  listar,
  obtenerEstadisticas,
  obtenerCategorias,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  esIdValido
};
