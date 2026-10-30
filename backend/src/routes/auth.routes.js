const express = require("express");
const { login, me } = require("../controllers/auth.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const validar = require("../middlewares/validar");
const { reglasLogin } = require("../validators/auth.validator");

const router = express.Router();

router.post("/login", reglasLogin, validar, login);
router.get("/me", verificarToken, me);

module.exports = router;