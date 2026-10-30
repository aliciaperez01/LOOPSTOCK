const { Router } = require("express");
const suppliers = require("../controllers/suppliers.controller");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");
const validar = require("../middlewares/validar");
const {
  reglasId,
  reglasCrear,
  reglasActualizar,
  reglasListar
} = require("../validators/suppliers.validator");

const suppliersRouter = Router();

// Todas las rutas de proveedores exigen estar autenticado
suppliersRouter.use(verificarToken);

const todosLosRoles = autorizarRoles("admin", "empleado");
const soloAdmin = autorizarRoles("admin");

// GET /api/suppliers - Listar (?search=, ?active=true|false)
suppliersRouter.get("/", todosLosRoles, reglasListar, validar, suppliers.listar);

// GET /api/suppliers/:id - Obtener proveedor por ID
suppliersRouter.get("/:id", todosLosRoles, reglasId, validar, suppliers.obtener);

// POST /api/suppliers - Crear proveedor (solo admin)
suppliersRouter.post("/", soloAdmin, reglasCrear, validar, suppliers.crear);

// PUT /api/suppliers/:id - Actualizar proveedor (solo admin)
suppliersRouter.put("/:id", soloAdmin, reglasId, reglasActualizar, validar, suppliers.actualizar);

// DELETE /api/suppliers/:id - Desactivar proveedor (solo admin)
suppliersRouter.delete("/:id", soloAdmin, reglasId, validar, suppliers.desactivar);

module.exports = suppliersRouter;
