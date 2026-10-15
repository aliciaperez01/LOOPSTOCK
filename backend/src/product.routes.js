
const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("./product.model");

const router = express.Router();

// GET /api/products - Listar productos
router.get("/", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error("Error al listar productos:", error.message);
    res.status(500).json({ message: "Error al obtener los productos" });
  }
});

// GET /api/products/:id - Consultar un producto
router.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    const status = error.message === "ID de producto no válido" ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
});

// POST /api/products - Crear producto
router.post("/", async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    const status = error.message.includes("obligatorios") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put("/:id", async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    const status =
      error.message.includes("no válido") ||
      error.message.includes("campos válidos")
        ? 400
        : 500;

    res.status(status).json({ message: error.message });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    const status = error.message === "ID de producto no válido" ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
});

module.exports = router;
