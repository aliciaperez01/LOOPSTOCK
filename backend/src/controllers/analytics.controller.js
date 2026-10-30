const analyticsService = require("../services/analytics.service");

// RESUMEN GENERAL DEL INVENTARIO
async function resumen(req, res) {
  const datos = await analyticsService.resumen();
  res.status(200).json(datos);
}

// INVENTARIO POR CATEGORÍA
async function porCategoria(req, res) {
  const datos = await analyticsService.porCategoria();
  res.status(200).json(datos);
}

// INVENTARIO POR PROVEEDOR
async function porProveedor(req, res) {
  const datos = await analyticsService.porProveedor();
  res.status(200).json(datos);
}

// ESTADÍSTICAS DE IMPORTACIONES CSV
async function importaciones(req, res) {
  const datos = await analyticsService.importaciones();
  res.status(200).json(datos);
}

// PRODUCTOS CON MÁS VALOR EN STOCK (?limit=, por defecto 10)
async function topValue(req, res) {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const datos = await analyticsService.topValue(limit);
  res.status(200).json(datos);
}

// RANKING DE PROVEEDORES POR VALOR EN STOCK
async function suppliersRanking(req, res) {
  const datos = await analyticsService.suppliersRanking();
  res.status(200).json(datos);
}

// IMPORTACIONES POR DÍA (?days=, por defecto 30)
async function importsTimeline(req, res) {
  const days = req.query.days ? Number(req.query.days) : 30;
  const datos = await analyticsService.importsTimeline(days);
  res.status(200).json(datos);
}

module.exports = {
  resumen,
  porCategoria,
  porProveedor,
  importaciones,
  topValue,
  suppliersRanking,
  importsTimeline
};
