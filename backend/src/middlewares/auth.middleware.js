const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

async function verificarToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    throw new AppError("Token no proporcionado", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Token inválido o expirado", 401);
  }

  const user = await User.findById(payload.id);
  if (!user || !user.active) {
    throw new AppError("Usuario no autorizado", 401);
  }

  req.user = user;
  next();
}

function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      throw new AppError("No tienes permisos para esta acción", 403);
    }
    next();
  };
}

module.exports = { verificarToken, autorizarRoles };
