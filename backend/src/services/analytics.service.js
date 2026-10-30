const Product = require("../models/Product");

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

module.exports = { resumen };
