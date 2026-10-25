const authService = require("../services/auth.service");

async function login(req, res) {
  const { email, password } = req.body || {};
  const { token, user } = await authService.login(email, password);

  res.status(200).json({
    message: "Login correcto",
    token,
    user
  });
}

module.exports = { login };