
const { ObjectId } = require("mongodb");
const { connectDB } = require("./db");

const COLLECTION_NAME = "products";

async function getCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME);
}

// Crear un producto
async function createProduct(product) {
  const collection = await getCollection();

  const newProduct = {
    name: product.name,
    sku: product.sku,
    category: product.category,
    quantity: Number(product.quantity ?? 0),
    price: Number(product.price ?? 0),
    supplier: product.supplier ?? "",
    minStock: Number(product.minStock ?? 0),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (!newProduct.name || !newProduct.sku) {
    throw new Error("El nombre y el SKU son obligatorios");
  }

  // Impedir SKU duplicados
  const existingProduct = await collection.findOne({
    sku: newProduct.sku
  });

  if (existingProduct) {
    throw new Error("Ya existe un producto con ese SKU");
  }

  const result = await collection.insertOne(newProduct);

  return {
    ...newProduct,
    _id: result.insertedId
  };
}

// Obtener todos los productos
async function getProducts() {
  const collection = await getCollection();

  return collection.find({}).sort({ name: 1 }).toArray();
}

// Obtener un producto por ID
async function getProductById(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error("ID de producto no válido");
  }

  const collection = await getCollection();

  return collection.findOne({
    _id: new ObjectId(id)
  });
}

// Actualizar un producto
async function updateProduct(id, changes) {
  if (!ObjectId.isValid(id)) {
    throw new Error("ID de producto no válido");
  }

  const collection = await getCollection();
  const productId = new ObjectId(id);

  const allowedFields = [
    "name",
    "sku",
    "category",
    "quantity",
    "price",
    "supplier",
    "minStock"
  ];

  const numericFields = ["quantity", "price", "minStock"];
  const updates = {};

  for (const field of allowedFields) {
    if (changes[field] !== undefined) {
      updates[field] = numericFields.includes(field)
        ? Number(changes[field])
        : changes[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No hay campos válidos para actualizar");
  }

  // Impedir que se asigne el SKU de otro producto
  if (updates.sku !== undefined) {
    const existingProduct = await collection.findOne({
      sku: updates.sku,
      _id: { $ne: productId }
    });

    if (existingProduct) {
      throw new Error("Ya existe un producto con ese SKU");
    }
  }

  updates.updatedAt = new Date();

  const result = await collection.updateOne(
    { _id: productId },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return getProductById(id);
}

// Eliminar un producto
async function deleteProduct(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error("ID de producto no válido");
  }

  const collection = await getCollection();

  const result = await collection.deleteOne({
    _id: new ObjectId(id)
  });

  return result.deletedCount === 1;
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
