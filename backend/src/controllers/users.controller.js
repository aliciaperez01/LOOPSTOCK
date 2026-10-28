const usersService = require("../services/users.service");
const AppError = require("../utils/AppError");

// LISTAR USUARIOS
async function listar(req, res) {
  const usuarios = await usersService.listar({
    role: req.query.role,
    active: req.query.active
  });
  res.status(200).json(usuarios);
}

// CREAR USUARIO (admin o empleado)
async function crear(req, res) {
  const usuario = await usersService.crear(req.body);
  res.status(201).json(usuario);
}

// DESACTIVAR USUARIO (baja lógica)
async function desactivar(req, res) {
  const usuario = await usersService.desactivar(req.params.id, req.user._id);
  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  res.status(200).json({
    mensaje: "Usuario desactivado correctamente",
    usuario
  });
}

// VALIDAR ID
function validarId(req, res, next) {
  if (!usersService.esIdValido(req.params.id)) {
    throw new AppError("ID de usuario no válido", 400);
  }
  next();
}

module.exports = {
  listar,
  crear,
  desactivar,
  validarId
};
