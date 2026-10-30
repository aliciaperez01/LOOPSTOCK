// FASE 2 — preparado, pero todavía SIN conectar en movements.routes.js.
// Se conecta cuando movements.* esté en main (T23, de Ali).
const { body, query } = require("express-validator");

const reglasCrear = [
  body("product").isMongoId().withMessage("El producto no tiene un id válido"),
  body("type").isIn(["entrada", "salida"]).withMessage("El tipo debe ser entrada o salida"),
  body("quantity").isInt({ min: 1 }).withMessage("La cantidad debe ser al menos 1").toInt(),
  body("notes").optional({ checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage("Las notas no pueden superar 500 caracteres")
];

const reglasListar = [
  query("type").optional().isIn(["entrada", "salida"]).withMessage("El tipo debe ser entrada o salida"),
  query("product").optional().isMongoId().withMessage("El producto no tiene un id válido"),
  query("page").optional().isInt({ min: 1 }).withMessage("page tiene que ser un entero mayor que 0"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit tiene que estar entre 1 y 100")
];

module.exports = { reglasCrear, reglasListar };
