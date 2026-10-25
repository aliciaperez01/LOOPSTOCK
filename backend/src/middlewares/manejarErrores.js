function manejarErrores(error, req, res, next) {
  console.error("Error en la API:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  // Clave duplicada en MongoDB (SKU, email, proveedor...)
  if (error.code === 11000) {
    const campo = Object.keys(error.keyPattern || {})[0] || "campo";
    return res.status(409).json({
      error: `Ya existe un registro con ese valor de "${campo}"`,
      campo
    });
  }

  if (error.name === "ValidationError") {
    const errores = Object.values(error.errors).map((detalle) => ({
      campo: detalle.path,
      mensaje: detalle.message
    }));
    return res.status(400).json({
      error: "Error de validación",
      detalles: errores
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      error: "El valor proporcionado no es válido",
      campo: error.path
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      error: "El cuerpo de la petición contiene JSON no válido"
    });
  }

  // Errores controlados: AppError (statusCode) o errores manuales (status)
  const codigo = error.statusCode || error.status;
  if (codigo >= 400 && codigo < 500) {
    return res.status(codigo).json({
      error: error.message
    });
  }

  return res.status(500).json({
    error: "Error interno del servidor"
  });
}

module.exports = manejarErrores;
