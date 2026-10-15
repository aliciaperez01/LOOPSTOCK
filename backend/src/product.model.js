
const { ObjectId } = require("mongodb");
const { connectDB } = require("./db");

const COLLECTION_NAME = "products";

async function getCollection() {
  const db = await connectDB();
  return db.collection(COLLECTION_NAME);
}

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

  const result = await collection.insertOne(newProduct);

  return { ...newProduct, _id: result.insertedId };
}

async function getProducts() {
  const collection = await getCollection();
  return collection.find({}).sort({ name: 1 }).toArray();
}

async function getProductById(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error("ID de producto no válido");
  }

  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

async function updateProduct(id, changes) {
  if (!ObjectId.isValid(id)) {
    throw new Error("ID de producto no válido");
  }

  const allowedFields = [
    "name",
    "sku",
    "category",
    "quantity",
    "price",
    "supplier",
    "minStock"
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (changes[field] !== undefined) {
      const numericFields = ["quantity", "price", "minStock"];

      updates[field] = numericFields.includes(field)
        ? Number(changes[field])
        : changes[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No hay campos válidos para actualizar");
  }

  updates.updatedAt = new Date();

  const collection = await getCollection();

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return getProductById(id);
}

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
