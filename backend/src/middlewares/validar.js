const { validationResult } = require("express-validator");

// Recoge lo que han anotado las reglas de express-validator.
// Si hay algún error, responde 400. Si no, deja pasar a next().
function validar(req, res, next) {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    const detalles = errores.array().map((error) => ({
      campo: error.path,
      mensaje: error.msg
    }));

    return res.status(400).json({
      error: detalles[0].mensaje,
      detalles
    });
  }

  next();
}

module.exports = validar;
