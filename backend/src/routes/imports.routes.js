const { Router } = require("express");
const imports = require("../controllers/imports.controller");
const { subirCsv } = require("../middlewares/upload.middleware");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");
const validar = require("../middlewares/validar");
const { reglasId } = require("../validators/imports.validator");

const importsRouter = Router();

// Importar datos es una operación sensible: solo administradores
importsRouter.use(verificarToken, autorizarRoles("admin"));

// POST /api/imports - Subir CSV de productos (campo "file")
importsRouter.post("/", subirCsv("file"), imports.importar);

// GET /api/imports - Historial de importaciones
importsRouter.get("/", imports.listar);

// GET /api/imports/:id - Detalle con errores por fila
importsRouter.get("/:id", reglasId, validar, imports.obtener);

module.exports = importsRouter;
