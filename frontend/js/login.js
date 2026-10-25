/* =========================================
   LOOPSTOCK - PÁGINA DE LOGIN
   Requiere: config.js, api.js, auth.js
   ========================================= */

// Si ya hay una sesión válida, no tiene sentido volver a pedir credenciales
if (getToken() && !tokenCaducado(getToken())) {
  window.location.replace("dashboard.html");
}

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

function mostrarMensaje(texto, tipo = "error") {
  loginMessage.textContent = texto;
  loginMessage.dataset.tipo = tipo;
}

if (new URLSearchParams(window.location.search).has("expirada")) {
  mostrarMensaje("Tu sesión ha caducado. Vuelve a iniciar sesión.", "aviso");
}

loginForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  if (!email || !password) {
    mostrarMensaje("Introduce tu email y tu contraseña.");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Entrando...";
  mostrarMensaje("", "");

  try {
    await login(email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    mostrarMensaje(mensajeDeError(error));
    loginForm.password.value = "";
    loginForm.password.focus();
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Iniciar sesión";
  }
});
