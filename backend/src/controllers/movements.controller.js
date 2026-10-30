
const movementsService = require("../services/movements.service.js");

// LISTAR MOVIMIENTOS
async function listar(req, res, next) {
  try {
    const filtros = {
      type: req.query.type,
      product: req.query.product,
      page: req.query.page,
      limit: req.query.limit
    };

    const resultado = await movementsService.listar(filtros);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

// CREAR MOVIMIENTO
async function crear(req, res, next) {
  try {
    // El usuario debe proceder de la autenticación,
    // nunca del cuerpo enviado por el cliente.
    const userId = req.user?._id || req.user?.id;

    const movimiento = await movementsService.crear(
      req.body,
      userId
    );

    res.status(201).json(movimiento);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  crear
};
