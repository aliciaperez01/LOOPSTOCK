
const express = require("express");
const {
  login,
  me,
  cambiarPassword
} = require("../controllers/auth.controller");

const { verificarToken } = require("../middlewares/auth.middleware");
const validar = require("../middlewares/validar");
const { reglasLogin, reglasCambioPassword } = require("../validators/auth.validator");

const router = express.Router();

router.post("/login", reglasLogin, validar, login);
router.get("/me", verificarToken, me);

// Cambiar contraseña del usuario autenticado
router.patch(
  "/password",
  verificarToken,
  reglasCambioPassword,
  validar,
  cambiarPassword
);

module.exports = router;
