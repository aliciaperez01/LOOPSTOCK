const { Router } = require("express");
const shifts = require("../controllers/shifts.controller");
const {
  verificarToken,
  autorizarRoles
} = require("../middlewares/auth.middleware");

const router = Router();

// Todas las rutas requieren autenticación.
router.use(verificarToken);

// GET /api/shifts - Consultar turnos propios o de un empleado (admin).
router.get("/", shifts.listar);

// Solo administradores pueden gestionar turnos.
router.post("/", autorizarRoles("admin"), shifts.crear);
router.patch("/:id", autorizarRoles("admin"), shifts.actualizar);
router.delete("/:id", autorizarRoles("admin"), shifts.eliminar);

module.exports = router;