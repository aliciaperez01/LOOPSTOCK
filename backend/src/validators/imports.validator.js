const { param } = require("express-validator");

// El archivo CSV ya lo valida upload.middleware.js (Multer): aquí solo el id.
const reglasId = [
  param("id").isMongoId().withMessage("El id no tiene formato válido")
];

module.exports = { reglasId };
