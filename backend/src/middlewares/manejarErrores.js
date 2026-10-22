function manejarErrores(error, req, res, next) {
  console.error("Error en la API:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      error: error.message
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      error: "Ya existe un producto con ese SKU"
    });
  }

  res.status(500).json({
    error: "Error interno del servidor"
  });
}

module.exports = manejarErrores;