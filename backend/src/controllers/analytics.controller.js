const analyticsService = require("../services/analytics.service");

// RESUMEN GENERAL DEL INVENTARIO
async function resumen(req, res) {
  const datos = await analyticsService.resumen();
  res.status(200).json(datos);
}

module.exports = { resumen };
