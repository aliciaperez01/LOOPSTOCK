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

module.exports = { resumen, porCategoria, porProveedor, importaciones };
