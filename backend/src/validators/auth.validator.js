const { body } = require("express-validator");

const reglasLogin = [
  body("email").trim().notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria")
];

const reglasCambioPassword = [
  body("currentPassword")
    .notEmpty().withMessage("La contraseña actual es obligatoria"),

  body("newPassword")
    .isString().withMessage("La nueva contraseña debe ser texto")
    .isLength({ min: 8 }).withMessage("La nueva contraseña debe tener al menos 8 caracteres")
];

module.exports = {
  reglasLogin,
  reglasCambioPassword
};