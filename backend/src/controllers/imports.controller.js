const importsService = require("../services/imports.service");
const AppError = require("../utils/AppError");

// IMPORTAR CSV DE PRODUCTOS
async function importar(req, res) {
  const job = await importsService.importarProductos(req.file, req.user._id);

  res.status(201).json({
    mensaje: `Importación ${job.status}: ${job.insertedRows} de ${job.totalRows} filas insertadas`,
    importacion: job
  });
}

// HISTORIAL DE IMPORTACIONES (sin el detalle de errores)
async function listar(req, res) {
  const importaciones = await importsService.listar();
  res.status(200).json(importaciones);
}

// DETALLE DE UNA IMPORTACIÓN (con errores por fila)
async function obtener(req, res) {
  const job = await importsService.buscarPorId(req.params.id);
  if (!job) throw new AppError("Importación no encontrada", 404);
  res.status(200).json(job);
}

async function listarProveedoresPendientes(req, res) {
  const resultado = await importsService.listarProveedoresPendientes(
    req.params.id
  );

  res.status(200).json(resultado);
}

async function asignarProveedores(req, res) {
  const resultado = await importsService.asignarProveedores(
    req.params.id,
    req.body.asignaciones
  );

  res.status(200).json(resultado);
}

module.exports = {
  importar,
  listar,
  obtener,
  listarProveedoresPendientes,
  asignarProveedores
};
