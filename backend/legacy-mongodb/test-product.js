
const {
  createProduct,
  getProducts
} = require("./product.model");

async function testProduct() {
  try {
    const product = await createProduct({
      name: "Auriculares de estudio",
      sku: "AUR-001",
      category: "Audio",
      quantity: 10,
      price: 89.99,
      supplier: "Proveedor de prueba",
      minStock: 2
    });

    console.log("Producto creado:", product);

    const products = await getProducts();
    console.log("Total de productos:", products.length);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    // Cerramos la conexión después de la prueba
    const { client } = require("./db");
    await client.close();
  }
}

testProduct();
