const Product = require("../models/Product");
const ImportJob = require("../models/ImportJob");

// RESUMEN GENERAL DEL INVENTARIO
// Solo cuenta productos activos: los inactivos (baja lógica) no son stock real.
async function resumen() {
  const [resultado] = await Product.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalUnits: { $sum: "$quantity" },
        stockValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        stockCost: { $sum: { $multiply: ["$quantity", "$cost"] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ["$quantity", "$minStock"] }, 1, 0] }
        },
        outOfStockCount: {
          $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] }
        },
        categories: { $addToSet: "$category" }
      }
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
        totalUnits: 1,
        stockValue: { $round: ["$stockValue", 2] },
        stockCost: { $round: ["$stockCost", 2] },
        lowStockCount: 1,
        outOfStockCount: 1,
        categoriesCount: { $size: "$categories" }
      }
    }
  ]);

  // Sin productos activos, aggregate devuelve [] → se responde con ceros.
  return (
    resultado || {
      totalProducts: 0,
      totalUnits: 0,
      stockValue: 0,
      stockCost: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categoriesCount: 0
    }
  );
}

// Agrupación común por categoría o proveedor (solo productos activos)
function agruparPor(campo, etiquetaVacia) {
  return Product.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: { $ifNull: [`$${campo}`, ""] },
        totalProducts: { $sum: 1 },
        totalUnits: { $sum: "$quantity" },
        stockValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ["$quantity", "$minStock"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        name: { $cond: [{ $eq: ["$_id", ""] }, etiquetaVacia, "$_id"] },
        totalProducts: 1,
        totalUnits: 1,
        stockValue: { $round: ["$stockValue", 2] },
        lowStockCount: 1
      }
    },
    { $sort: { stockValue: -1, name: 1 } }
  ]);
}

// INVENTARIO POR CATEGORÍA
function porCategoria() {
  return agruparPor("category", "Sin categoría");
}

// INVENTARIO POR PROVEEDOR (Product.supplier guarda el nombre)
function porProveedor() {
  return agruparPor("supplier", "Sin proveedor");
}

// ESTADÍSTICAS DE IMPORTACIONES CSV
async function importaciones() {
  const [resultado] = await ImportJob.aggregate([
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        partial: { $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        totalRows: { $sum: "$totalRows" },
        insertedRows: { $sum: "$insertedRows" },
        errorRows: { $sum: "$errorRows" },
        lastImportAt: { $max: "$createdAt" }
      }
    },
    {
      $project: {
        _id: 0,
        totalJobs: 1,
        completed: 1,
        partial: 1,
        failed: 1,
        totalRows: 1,
        insertedRows: 1,
        errorRows: 1,
        // % de filas insertadas sobre el total procesado
        successRate: {
          $cond: [
            { $gt: ["$totalRows", 0] },
            { $round: [{ $multiply: [{ $divide: ["$insertedRows", "$totalRows"] }, 100] }, 2] },
            0
          ]
        },
        lastImportAt: 1
      }
    }
  ]);

  return (
    resultado || {
      totalJobs: 0,
      completed: 0,
      partial: 0,
      failed: 0,
      totalRows: 0,
      insertedRows: 0,
      errorRows: 0,
      successRate: 0,
      lastImportAt: null
    }
  );
}

module.exports = { resumen, porCategoria, porProveedor, importaciones };
