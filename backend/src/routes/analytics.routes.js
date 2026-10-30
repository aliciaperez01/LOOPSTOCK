const { Router } = require("express");
const analytics = require("../controllers/analytics.controller");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");
const validar = require("../middlewares/validar");
const {
  reglasTopValue,
  reglasImportsTimeline
} = require("../validators/analytics.validator");

const analyticsRouter = Router();

// Todas las rutas de analítica exigen estar autenticado
analyticsRouter.use(verificarToken);

const todosLosRoles = autorizarRoles("admin", "empleado");

// GET /api/analytics/summary - Resumen general del inventario
analyticsRouter.get("/summary", todosLosRoles, analytics.resumen);

// GET /api/analytics/by-category - Inventario agrupado por categoría
analyticsRouter.get("/by-category", todosLosRoles, analytics.porCategoria);

// GET /api/analytics/by-supplier - Inventario agrupado por proveedor
analyticsRouter.get("/by-supplier", todosLosRoles, analytics.porProveedor);

// GET /api/analytics/imports - Estadísticas de importaciones CSV
analyticsRouter.get("/imports", todosLosRoles, analytics.importaciones);

// GET /api/analytics/imports/timeline - Importaciones por día (?days=)
analyticsRouter.get(
  "/imports/timeline",
  todosLosRoles,
  reglasImportsTimeline,
  validar,
  analytics.importsTimeline
);

// GET /api/analytics/top-value - Productos con más valor en stock (?limit=)
analyticsRouter.get(
  "/top-value",
  todosLosRoles,
  reglasTopValue,
  validar,
  analytics.topValue
);

// GET /api/analytics/suppliers-ranking - Proveedores por valor en stock
analyticsRouter.get("/suppliers-ranking", todosLosRoles, analytics.suppliersRanking);

module.exports = analyticsRouter;
