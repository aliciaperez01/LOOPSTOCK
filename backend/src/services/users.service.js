const mongoose = require("mongoose");
const User = require("../models/User");
const { ROLES } = require("../models/User");
const AppError = require("../utils/AppError");

// Campos que el admin puede enviar al crear (evita asignar _id, active, fechas...)
const CAMPOS_CREACION = ["name", "email", "password", "role"];

function filtrarCampos(datos = {}) {
  const limpio = {};
  for (const campo of CAMPOS_CREACION) {
    if (datos[campo] !== undefined) limpio[campo] = datos[campo];
  }
  return limpio;
}

// LISTAR Y FILTRAR USUARIOS (?role=admin|empleado, ?active=true|false)
async function listar({ role, active } = {}) {
  const filtro = {};

  if (role !== undefined) {
    if (!ROLES.includes(role)) {
      throw new AppError(`Rol no válido. Valores permitidos: ${ROLES.join(", ")}`, 400);
    }
    filtro.role = role;
  }

  if (active === "true") filtro.active = true;
  if (active === "false") filtro.active = false;

  return User.find(filtro).sort({ name: 1 });
}

// CREAR USUARIO: el hash lo hace el pre("save") de User.js
async function crear(datos) {
  return User.create(filtrarCampos(datos));
}

// ELIMINAR USUARIO (borrado físico). Un admin no puede eliminarse a sí mismo
async function eliminar(id, idSolicitante) {
  if (String(id) === String(idSolicitante)) {
    throw new AppError("No puedes eliminar tu propio usuario", 400);
  }

  return User.findByIdAndDelete(id);
}

function esIdValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  listar,
  crear,
  eliminar,
  esIdValido
};
