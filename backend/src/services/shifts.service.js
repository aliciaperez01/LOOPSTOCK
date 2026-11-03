const mongoose = require("mongoose");
const Shift = require("../models/Shift");
const User = require("../models/User");
const AppError = require("../utils/AppError");

function validarFecha(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return false;

  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validarHoras(startTime, endTime) {
  const formato = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!formato.test(startTime || "") || !formato.test(endTime || "")) {
    throw new AppError("El formato de las horas debe ser HH:mm", 400);
  }

  // Por ahora no admitimos turnos que crucen la medianoche.
  if (endTime <= startTime) {
    throw new AppError("La hora de fin debe ser posterior a la de inicio", 400);
  }
}

function validarId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Identificador no válido", 400);
  }
}

async function comprobarEmpleado(employeeId) {
  validarId(employeeId);

  const empleado = await User.findOne({
    _id: employeeId,
    role: "empleado",
    active: true
  });

  if (!empleado) {
    throw new AppError("El empleado no existe o está desactivado", 404);
  }

  return empleado;
}

// LISTAR TURNOS
async function listar({ usuario, year, month, employeeId }) {
  const filtro = {};

  if (year !== undefined || month !== undefined) {
    const anio = Number(year);
    const mes = Number(month);

    if (
      !Number.isInteger(anio) ||
      !Number.isInteger(mes) ||
      mes < 1 ||
      mes > 12 ||
      anio < 2000 ||
      anio > 2100
    ) {
      throw new AppError("Año o mes no válido", 400);
    }

    const inicio = `${anio}-${String(mes).padStart(2, "0")}-01`;
    const siguienteMes = new Date(Date.UTC(anio, mes, 1));
    const fin = [
      siguienteMes.getUTCFullYear(),
      String(siguienteMes.getUTCMonth() + 1).padStart(2, "0"),
      "01"
    ].join("-");

    filtro.date = { $gte: inicio, $lt: fin };
  }

  if (usuario.role === "admin") {
    if (employeeId) {
      await comprobarEmpleado(employeeId);
      filtro.employee = employeeId;
    }
  } else {
    filtro.employee = usuario._id;
  }

  return Shift.find(filtro)
    .populate("employee", "name email")
    .populate("createdBy", "name")
    .sort({ date: 1, startTime: 1 });
}

// CREAR TURNO
async function crear(datos, adminId) {
  const { employee, date, startTime, endTime, notes } = datos;

  if (!validarFecha(date)) {
    throw new AppError("La fecha no es válida", 400);
  }

  validarHoras(startTime, endTime);
  await comprobarEmpleado(employee);

  return Shift.create({
    employee,
    date,
    startTime,
    endTime,
    notes,
    createdBy: adminId
  });
}

// MODIFICAR TURNO
async function actualizar(id, datos) {
  validarId(id);

  const turno = await Shift.findById(id);

  if (!turno) {
    throw new AppError("Turno no encontrado", 404);
  }

  const employee = datos.employee ?? turno.employee;
  const date = datos.date ?? turno.date;
  const startTime = datos.startTime ?? turno.startTime;
  const endTime = datos.endTime ?? turno.endTime;

  if (!validarFecha(date)) {
    throw new AppError("La fecha no es válida", 400);
  }

  validarHoras(startTime, endTime);
  await comprobarEmpleado(employee);

  if (datos.employee !== undefined) turno.employee = employee;
  if (datos.date !== undefined) turno.date = date;
  if (datos.startTime !== undefined) turno.startTime = startTime;
  if (datos.endTime !== undefined) turno.endTime = endTime;
  if (datos.notes !== undefined) turno.notes = datos.notes;

  await turno.save();

  return turno.populate([
    { path: "employee", select: "name email" },
    { path: "createdBy", select: "name" }
  ]);
}

// ELIMINAR TURNO
async function eliminar(id) {
  validarId(id);

  const turno = await Shift.findByIdAndDelete(id);

  if (!turno) {
    throw new AppError("Turno no encontrado", 404);
  }

  return turno;
}

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar
};