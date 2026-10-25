const suppliersService = require("../services/suppliers.service");
const AppError = require("../utils/AppError");

// LISTAR PROVEEDORES
async function listar(req, res) {
  const proveedores = await suppliersService.listar({
    search: req.query.search,
    active: req.query.active
  });
  res.status(200).json(proveedores);
}

// OBTENER PROVEEDOR POR ID
async function obtener(req, res) {
  const proveedor = await suppliersService.buscarPorId(req.params.id);
  if (!proveedor) throw new AppError("Proveedor no encontrado", 404);
  res.status(200).json(proveedor);
}

// CREAR PROVEEDOR
async function crear(req, res) {
  const proveedor = await suppliersService.crear(req.body);
  res.status(201).json(proveedor);
}

// ACTUALIZAR PROVEEDOR
async function actualizar(req, res) {
  const proveedor = await suppliersService.actualizar(req.params.id, req.body);
  if (!proveedor) throw new AppError("Proveedor no encontrado", 404);
  res.status(200).json(proveedor);
}

// DESACTIVAR PROVEEDOR (baja lógica)
async function desactivar(req, res) {
  const proveedor = await suppliersService.desactivar(req.params.id);
  if (!proveedor) throw new AppError("Proveedor no encontrado", 404);
  res.status(200).json({
    mensaje: "Proveedor desactivado correctamente",
    proveedor
  });
}

// VALIDAR ID
function validarId(req, res, next) {
  if (!suppliersService.esIdValido(req.params.id)) {
    throw new AppError("ID de proveedor no válido", 400);
  }
  next();
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  desactivar,
  validarId
};
