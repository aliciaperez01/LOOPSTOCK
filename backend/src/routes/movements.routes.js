
const { Router } = require("express");
const movements = require("../controllers/movements.controller.js");
const { verificarToken } = require("../middlewares/auth.middleware.js");
const validar = require("../middlewares/validar");
const { reglasCrear, reglasListar } = require("../validators/movements.validator");

const movementsRouter = Router();

// Todas las rutas requieren autenticación
movementsRouter.use(verificarToken);

// GET /api/movements - Listar movimientos
movementsRouter.get("/", reglasListar, validar, movements.listar);

// POST /api/movements - Registrar entrada o salida
movementsRouter.post("/", reglasCrear, validar, movements.crear);

module.exports = movementsRouter;
