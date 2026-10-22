
const mongoose = require("mongoose");
const Product = require("../models/Product.js");


// LISTAR, BUSCAR Y FILTRAR PRODUCTOS
async function listar(filtros = {}) {
  const filtro = {};

  if (filtros.category) {
    filtro.category = filtros.category;
  }

  if (filtros.search) {
    const busqueda = filtros.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filtro.$or = [
        { name: { $regex: busqueda, $options: "i" } },
        { sku: { $regex: busqueda, $options: "i" } },
        { category: { $regex: busqueda, $options: "i" } },
        { supplier: { $regex: busqueda, $options: "i" } }
        ];
  }

  if (filtros.lowStock === true) {
    filtro.$expr = { $lte: ["$quantity", "$minStock"] };
  }

  return Product.find(filtro).sort({ name: 1 });
}


// BUSCAR POR ID
async function buscarPorId(id) {
  return Product.findById(id);
}

// CREAR PRODUCTO
async function crear(datos) {
  return Product.create(datos);
}

// ACTUALIZAR PRODUCTO
async function actualizar(id, datos) {
  return Product.findByIdAndUpdate(id, datos, {
    returnDocument: "after",
    runValidators: true,
    upsert: false
  });
}

// ELIMINAR PRODUCTO
// La comprobación de movimientos se añadirá cuando confirmemos
// el modelo y la colección donde se guardan.
async function eliminar(id) {
  return Product.findByIdAndDelete(id);
}

// VALIDAR ID
function esIdValido(id) {
  return mongoose.isValidObjectId(id);
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  esIdValido
};
