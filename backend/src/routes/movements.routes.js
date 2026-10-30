
const { Router } = require("express");
const movements = require("../controllers/movements.controller.js");
const { verificarToken } = require("../middlewares/auth.middleware.js");

const movementsRouter = Router();

// Todas las rutas requieren autenticación
movementsRouter.use(verificarToken);

// GET /api/movements - Listar movimientos
movementsRouter.get("/", movements.listar);

// POST /api/movements - Registrar entrada o salida
movementsRouter.post("/", movements.crear);

module.exports = movementsRouter;
