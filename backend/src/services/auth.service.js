
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

async function login(email, password) {
  if (!email || !password) {
    throw new AppError("Email y contraseña son obligatorios", 400);
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim()
  }).select("+password");

  // Mismo mensaje si no existe o si la contraseña falla
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Credenciales incorrectas", 401);
  }

  if (!user.active) {
    throw new AppError("Usuario desactivado", 403);
  }

  return { token: signToken(user), user };
}

async function cambiarPassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new AppError(
      "La contraseña actual y la nueva son obligatorias",
      400
    );
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new AppError(
      "La nueva contraseña debe tener al menos 8 caracteres",
      400
    );
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const coincide = await user.comparePassword(currentPassword);

  if (!coincide) {
    throw new AppError(
      "La contraseña actual es incorrecta",
      400
    );
  }

  user.password = newPassword;
  await user.save();

  return { message: "Contraseña actualizada correctamente" };
}

module.exports = {
  login,
  signToken,
  cambiarPassword
};
