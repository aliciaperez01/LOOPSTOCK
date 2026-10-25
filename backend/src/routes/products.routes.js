const { Router } = require("express");
const products = require("../controllers/products.controller.js");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");

const productsRouter = Router();

// Todas las rutas de productos exigen estar autenticado
productsRouter.use(verificarToken);

// Roles con acceso a la gestión de productos
const todosLosRoles = autorizarRoles("admin", "empleado");
const soloAdmin = autorizarRoles("admin");

// GET /api/products/low-stock - Productos con stock bajo
productsRouter.get("/low-stock", todosLosRoles, products.listarBajoStock);

// GET /api/products - Listar y filtrar productos
productsRouter.get("/", todosLosRoles, products.listar);

// GET /api/products/:id - Obtener producto por ID
productsRouter.get("/:id", todosLosRoles, products.validarId, products.obtener);

// POST /api/products - Crear producto
productsRouter.post("/", todosLosRoles, products.crear);

// PUT /api/products/:id - Actualizar producto
productsRouter.put("/:id", todosLosRoles, products.validarId, products.actualizar);

// DELETE /api/products/:id - Eliminar producto (solo admin)
productsRouter.delete("/:id", soloAdmin, products.validarId, products.eliminar);

module.exports = productsRouter;
