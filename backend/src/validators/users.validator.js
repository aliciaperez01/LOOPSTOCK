const { body, param, query } = require("express-validator");
const { ROLES } = require("../models/User");

const reglasId = [
  param("id").isMongoId().withMessage("El id no tiene formato válido")
];

const reglasCrear = [
  body("name").trim().notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 60 }).withMessage("El nombre debe tener entre 2 y 60 caracteres"),
  body("email").trim().notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
  body("role").optional().isIn(ROLES)
    .withMessage(`Rol no válido. Valores permitidos: ${ROLES.join(", ")}`)
];

const reglasListar = [
  query("role").optional().isIn(ROLES)
    .withMessage(`Rol no válido. Valores permitidos: ${ROLES.join(", ")}`),
  query("active").optional().isIn(["true", "false"])
    .withMessage("active tiene que ser true o false")
];

module.exports = { reglasId, reglasCrear, reglasListar };
