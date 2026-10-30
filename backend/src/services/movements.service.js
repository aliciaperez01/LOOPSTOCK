
const mongoose = require("mongoose");
const Movement = require("../models/Movement.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const AppError = require("../utils/AppError.js");

// LISTAR MOVIMIENTOS
async function listar(filtros = {}) {
  const filtro = {};

  if (filtros.type) {
    filtro.type = filtros.type;
  }

  if (filtros.product) {
    if (!mongoose.isValidObjectId(filtros.product)) {
      throw new AppError("ID de producto no válido", 400);
    }

    filtro.product = filtros.product;
  }

  // Buscar por nombre o SKU del producto
  if (filtros.search?.trim()) {
    const termino = filtros.search.trim();

    // Escapar caracteres especiales de la expresión regular
    const terminoEscapado = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(terminoEscapado, "i");

    const productosEncontrados = await Product.find({
      $or: [
        { name: regex },
        { sku: regex }
      ]
    }).select("_id");

    const idsProductos = productosEncontrados.map(
      producto => producto._id
    );

    filtro.product = {
      $in: idsProductos
    };
  }

  const page = Math.max(
    1,
    Number.parseInt(filtros.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(filtros.limit, 10) || 10)
  );

  const [items, total] = await Promise.all([
    Movement.find(filtro)
      .populate("product", "name sku")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Movement.countDocuments(filtro)
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}

// REGISTRAR MOVIMIENTO Y ACTUALIZAR STOCK
async function crear(datos, userId) {
  if (!mongoose.isValidObjectId(datos.product)) {
    throw new AppError("ID de producto no válido", 400);
  }

  if (!["entrada", "salida"].includes(datos.type)) {
    throw new AppError("El tipo debe ser entrada o salida", 400);
  }

  const quantity = Number(datos.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError("La cantidad debe ser un entero mayor que cero", 400);
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Usuario responsable no válido", 401);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("Usuario responsable no encontrado", 401);
  }

  const incremento = datos.type === "entrada" ? quantity : -quantity;

  // La actualización condicional evita que dos salidas simultáneas
  // dejen el stock por debajo de cero.
  const condiciones = { _id: datos.product };

  if (datos.type === "salida") {
    condiciones.quantity = { $gte: quantity };
  }

  const product = await Product.findOneAndUpdate(
    condiciones,
    { $inc: { quantity: incremento } },
    { returnDocument: "after", runValidators: true }
  );

  if (!product) {
    const existe = await Product.exists({ _id: datos.product });

    if (!existe) {
      throw new AppError("Producto no encontrado", 404);
    }

    throw new AppError("Stock insuficiente para realizar la salida", 400);
  }

  try {
    return await Movement.create({
      product: product._id,
      type: datos.type,
      quantity,
      user: user._id,
      notes: datos.notes || ""
    });
  } catch (error) {
    // Si no se puede guardar el movimiento, se intenta revertir el stock.
    await Product.updateOne(
      { _id: product._id },
      { $inc: { quantity: -incremento } }
    );

    throw error;
  }
}

module.exports = {
  listar,
  crear
};
