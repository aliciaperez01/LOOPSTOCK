
const authService = require("../services/auth.service");

async function login(req, res) {
  const { email, password } = req.body || {};
  const { token, user } = await authService.login(email, password);

  res.status(200).json({
    message: "Login correcto",
    token,
    user,
  });
}

function me(req, res) {
  res.status(200).json({ user: req.user });
}

async function cambiarPassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  const resultado = await authService.cambiarPassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  res.status(200).json(resultado);
}

module.exports = {
  login,
  me,
  cambiarPassword
};
