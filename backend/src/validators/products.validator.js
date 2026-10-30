// FASE 2 — preparado, pero todavía SIN conectar en products.routes.js.
// Se conecta cuando la integración de Ali (paginación, stats, categories) esté en main,
// para no pisar los archivos que está tocando ella.
const { body, param, query } = require("express-validator");

const reglasId = [
  param("id").isMongoId().withMessage("El id no tiene formato válido")
];

const CAMPOS_COMUNES = [
  body("brand").optional({ checkFalsy: true }).trim(),
  body("model").optional({ checkFalsy: true }).trim(),
  body("description").optional({ checkFalsy: true }).trim(),
  body("price").optional().isFloat({ min: 0 }).withMessage("El precio no puede ser negativo").toFloat(),
  body("cost").optional().isFloat({ min: 0 }).withMessage("El coste no puede ser negativo").toFloat(),
  body("quantity").optional().isInt({ min: 0 }).withMessage("El stock no puede ser negativo").toInt(),
  body("minStock").optional().isInt({ min: 1 }).withMessage("El stock mínimo debe ser al menos 1").toInt(),
  body("supplier").optional({ checkFalsy: true }).trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("El estado debe ser active o inactive")
];

const reglasCrear = [
  body("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("sku").trim().notEmpty().withMessage("El SKU es obligatorio"),
  body("category").trim().notEmpty().withMessage("La categoría es obligatoria"),
  body("price").notEmpty().withMessage("El precio es obligatorio")
    .isFloat({ min: 0 }).withMessage("El precio no puede ser negativo").toFloat(),
  body("quantity").notEmpty().withMessage("La cantidad es obligatoria")
    .isInt({ min: 0 }).withMessage("El stock no puede ser negativo").toInt(),
  body("minStock").notEmpty().withMessage("El stock mínimo es obligatorio")
    .isInt({ min: 1 }).withMessage("El stock mínimo debe ser al menos 1").toInt(),
  ...CAMPOS_COMUNES
];

const reglasActualizar = [
  body("name").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío"),
  body("sku").optional().trim().notEmpty().withMessage("El SKU no puede estar vacío"),
  body("category").optional().trim().notEmpty().withMessage("La categoría no puede estar vacía"),
  ...CAMPOS_COMUNES
];

const reglasListar = [
  query("page").optional().isInt({ min: 1 }).withMessage("page tiene que ser un entero mayor que 0"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit tiene que estar entre 1 y 100"),
  query("category").optional().trim(),
  query("search").optional().trim()
];

module.exports = { reglasId, reglasCrear, reglasActualizar, reglasListar };
