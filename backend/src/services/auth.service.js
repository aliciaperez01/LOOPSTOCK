const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError.js");

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

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("+password");

  // Mismo mensaje si no existe o si la contraseña falla
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Credenciales incorrectas", 401);
  }

  if (!user.active) {
    throw new AppError("Usuario desactivado", 403);
  }

  return { token: signToken(user), user };
}

module.exports = { login, signToken };