const shiftsService = require("../services/shifts.service");

// LISTAR TURNOS
async function listar(req, res) {
  const turnos = await shiftsService.listar({
    usuario: req.user,
    year: req.query.year,
    month: req.query.month,
    employeeId: req.query.employeeId
  });

  res.status(200).json(turnos);
}

// CREAR TURNO (solo admin)
async function crear(req, res) {
  const turno = await shiftsService.crear(req.body, req.user._id);

  res.status(201).json({
    mensaje: "Turno creado correctamente",
    turno
  });
}

// MODIFICAR TURNO (solo admin)
async function actualizar(req, res) {
  const turno = await shiftsService.actualizar(req.params.id, req.body);

  res.status(200).json({
    mensaje: "Turno actualizado correctamente",
    turno
  });
}

// ELIMINAR TURNO (solo admin)
async function eliminar(req, res) {
  const turno = await shiftsService.eliminar(req.params.id);

  res.status(200).json({
    mensaje: "Turno eliminado correctamente",
    turno
  });
}

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar
};