const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB
const TIPOS_CSV = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel", // Windows envía así los .csv
  "text/plain"
];

// El archivo se queda en memoria (req.file.buffer): no se escribe en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension !== ".csv" || !TIPOS_CSV.includes(file.mimetype)) {
      return cb(new AppError("Solo se admiten archivos .csv", 400));
    }
    cb(null, true);
  }
});

// Envuelve multer para traducir sus errores a respuestas 400
function subirCsv(campo) {
  const middleware = upload.single(campo);

  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        const mensajes = {
          LIMIT_FILE_SIZE: "El archivo supera el tamaño máximo de 2 MB",
          LIMIT_FILE_COUNT: "Solo se puede subir un archivo",
          LIMIT_UNEXPECTED_FILE: `El archivo debe enviarse en el campo "${campo}"`
        };
        return next(new AppError(mensajes[error.code] || error.message, 400));
      }
      if (error) return next(error);

      if (!req.file) {
        return next(new AppError(`Falta el archivo CSV en el campo "${campo}"`, 400));
      }
      next();
    });
  };
}

module.exports = { subirCsv, TAMANO_MAXIMO };
