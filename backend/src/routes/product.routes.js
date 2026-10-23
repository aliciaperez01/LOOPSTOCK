const { Router } = require("express");
const products = require("../controllers/products.controller.js");

const productsRouter = Router();

// GET /api/products - Listar y filtrar productos
productsRouter.get("/", products.listar);

// GET /api/products/low-stock - Productos con stock bajo
productsRouter.get("/low-stock", (req, res, next) => {
  req.query.lowStock = "true";
  products.listar(req, res, next);
});

// GET /api/products/:id - Obtener producto por ID
productsRouter.get("/:id", products.validarId, products.obtener);

// POST /api/products - Crear producto
productsRouter.post("/", products.crear);

// PUT /api/products/:id - Actualizar producto
productsRouter.put("/:id", products.validarId, products.actualizar);

// DELETE /api/products/:id - Eliminar producto
productsRouter.delete("/:id", products.validarId, products.eliminar);

module.exports = productsRouter;