const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");

// Campos que el cliente puede enviar (evita asignar _id, active, fechas...)
const CAMPOS_EDITABLES = [
  "name",
  "taxId",
  "contactName",
  "email",
  "phone",
  "website",
  "notes"
];

function filtrarCampos(datos = {}) {
  const limpio = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (datos[campo] !== undefined) limpio[campo] = datos[campo];
  }
  return limpio;
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// LISTAR, BUSCAR Y FILTRAR PROVEEDORES
async function listar({ search, active } = {}) {
  const filtro = {};

  if (search) {
    const busqueda = escaparRegex(search.trim());
    filtro.$or = [
      { name: { $regex: busqueda, $options: "i" } },
      { taxId: { $regex: busqueda, $options: "i" } }
    ];
  }

  if (active === "true") filtro.active = true;
  if (active === "false") filtro.active = false;

  return Supplier.find(filtro).sort({ name: 1 });
}

async function buscarPorId(id) {
  return Supplier.findById(id);
}

async function crear(datos) {
  return Supplier.create(filtrarCampos(datos));
}

async function actualizar(id, datos) {
  return Supplier.findByIdAndUpdate(id, filtrarCampos(datos), {
    returnDocument: "after",
    runValidators: true
  });
}

// Baja lógica: se desactiva en lugar de borrar
async function desactivar(id) {
  return Supplier.findByIdAndUpdate(id, { active: false }, { returnDocument: "after" });
}

function esIdValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  desactivar,
  esIdValido
};
