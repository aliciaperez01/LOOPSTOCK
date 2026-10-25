/* =========================================
   LOOPSTOCK - SESIÓN Y PERMISOS
   Requiere: config.js, api.js
   ========================================= */

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function esAdmin() {
  return getUsuario()?.role === "admin";
}

// Lee la fecha de caducidad del JWT (solo para la interfaz: el backend es quien valida)
function tokenCaducado(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

async function login(email, password) {
  const { token, user } = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password }
  });

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "login.html";
}

// Guard: llamar al principio de cada página protegida
function protegerPagina({ roles } = {}) {
  const token = getToken();

  if (!token || tokenCaducado(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace(token ? "login.html?expirada=1" : "login.html");
    return false;
  }

  if (roles && !roles.includes(getUsuario()?.role)) {
    window.location.replace("dashboard.html");
    return false;
  }

  document.addEventListener("DOMContentLoaded", aplicarSesionEnPagina);
  return true;
}

// Oculta lo que no corresponde al rol, muestra el usuario y activa "Cerrar sesión"
function aplicarSesionEnPagina() {
  const usuario = getUsuario();

  if (!esAdmin()) {
    document.querySelectorAll('[data-role="admin"]').forEach((el) => el.remove());
  }

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = usuario ? `${usuario.name} (${usuario.role})` : "";
  });

  document.querySelectorAll("[data-logout]").forEach((el) => {
    el.addEventListener("click", (evento) => {
      evento.preventDefault();
      logout();
    });
  });
}
