const { body } = require("express-validator");

const reglasLogin = [
  body("email").trim().notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria")
];

module.exports = { reglasLogin };
