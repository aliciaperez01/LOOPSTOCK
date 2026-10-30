const { Router } = require("express");
const users = require("../controllers/users.controller");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");
const validar = require("../middlewares/validar");
const {
  reglasId,
  reglasCrear,
  reglasListar
} = require("../validators/users.validator");

const usersRouter = Router();

// Todas las rutas de usuarios: token obligatorio y solo admin
usersRouter.use(verificarToken, autorizarRoles("admin"));

// GET /api/users - Listar (?role=admin|empleado, ?active=true|false)
usersRouter.get("/", reglasListar, validar, users.listar);

// POST /api/users - Crear usuario (role opcional, por defecto "empleado")
usersRouter.post("/", reglasCrear, validar, users.crear);

// DELETE /api/users/:id - Desactivar usuario (baja lógica)
usersRouter.delete("/:id", reglasId, validar, users.desactivar);

module.exports = usersRouter;
