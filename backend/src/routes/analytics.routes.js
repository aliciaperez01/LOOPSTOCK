const { Router } = require("express");
const analytics = require("../controllers/analytics.controller");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");

const analyticsRouter = Router();

// Todas las rutas de analítica exigen estar autenticado
analyticsRouter.use(verificarToken);

const todosLosRoles = autorizarRoles("admin", "empleado");

// GET /api/analytics/summary - Resumen general del inventario
analyticsRouter.get("/summary", todosLosRoles, analytics.resumen);

module.exports = analyticsRouter;
