const { body, param, query } = require("express-validator");

const reglasId = [
  param("id").isMongoId().withMessage("El id no tiene formato válido")
];

const CAMPOS_COMUNES = [
  body("taxId").optional({ checkFalsy: true }).trim()
    .matches(/^[A-Z0-9]{8,12}$/i).withMessage("El CIF/NIF no es válido"),
  body("contactName").optional({ checkFalsy: true }).trim()
    .isLength({ max: 80 }).withMessage("El nombre de contacto no puede superar 80 caracteres"),
  body("email").optional({ checkFalsy: true }).trim()
    .isEmail().withMessage("El email no es válido"),
  body("phone").optional({ checkFalsy: true }).trim()
    .isLength({ max: 20 }).withMessage("El teléfono no puede superar 20 caracteres"),
  body("notes").optional({ checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage("Las notas no pueden superar 500 caracteres")
];

const reglasCrear = [
  body("name").trim().notEmpty().withMessage("El nombre del proveedor es obligatorio")
    .isLength({ min: 2, max: 80 }).withMessage("El nombre debe tener entre 2 y 80 caracteres"),
  ...CAMPOS_COMUNES
];

// En la actualización ningún campo es obligatorio: es parcial.
const reglasActualizar = [
  body("name").optional().trim()
    .isLength({ min: 2, max: 80 }).withMessage("El nombre debe tener entre 2 y 80 caracteres"),
  ...CAMPOS_COMUNES
];

const reglasListar = [
  query("search").optional().trim()
    .isLength({ max: 80 }).withMessage("La búsqueda no puede superar 80 caracteres"),
  query("active").optional().isIn(["true", "false"])
    .withMessage("active tiene que ser true o false")
];

module.exports = { reglasId, reglasCrear, reglasActualizar, reglasListar };
