const { Router } = require("express");
const suppliers = require("../controllers/suppliers.controller");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");

const suppliersRouter = Router();

// Todas las rutas de proveedores exigen estar autenticado
suppliersRouter.use(verificarToken);

const todosLosRoles = autorizarRoles("admin", "empleado");
const soloAdmin = autorizarRoles("admin");

// GET /api/suppliers - Listar (?search=, ?active=true|false)
suppliersRouter.get("/", todosLosRoles, suppliers.listar);

// GET /api/suppliers/:id - Obtener proveedor por ID
suppliersRouter.get("/:id", todosLosRoles, suppliers.validarId, suppliers.obtener);

// POST /api/suppliers - Crear proveedor (solo admin)
suppliersRouter.post("/", soloAdmin, suppliers.crear);

// PUT /api/suppliers/:id - Actualizar proveedor (solo admin)
suppliersRouter.put("/:id", soloAdmin, suppliers.validarId, suppliers.actualizar);

// DELETE /api/suppliers/:id - Desactivar proveedor (solo admin)
suppliersRouter.delete("/:id", soloAdmin, suppliers.validarId, suppliers.desactivar);

module.exports = suppliersRouter;
