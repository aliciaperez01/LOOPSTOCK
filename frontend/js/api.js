/* =========================================
   LOOPSTOCK - CLIENTE DE LA API
   Requiere: config.js
   ========================================= */

// Petición a la API con token, JSON y errores legibles
async function apiFetch(ruta, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const opciones = { method, headers: { ...headers } };

  if (token) {
    opciones.headers.Authorization = `Bearer ${token}`;
  }

  // FormData (archivos): el navegador pone el Content-Type con su "boundary"
  if (body instanceof FormData) {
    opciones.body = body;
  } else if (body !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(body);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, opciones);
  } catch {
    throw new Error("No se puede conectar con el servidor. Comprueba que el backend está funcionando.");
  }

  // Token caducado o inválido: cerrar sesión y volver al login
  if (respuesta.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "login.html?expirada=1";
    throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = new Error(datos?.error || `Error ${respuesta.status} en la petición`);
    error.status = respuesta.status;
    error.detalles = datos?.detalles || [];
    throw error;
  }

  return datos;
}

// fetch() con el token de sesión, para el código que gestiona él mismo la respuesta
// (products.js, product-form.js, dashboard.js). Recibe la URL completa.
function fetchConToken(url, opciones = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...(opciones.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...opciones, headers });
}

// Convierte un error de la API en texto, incluyendo el detalle por campo
function mensajeDeError(error) {
  if (!error.detalles || error.detalles.length === 0) return error.message;
  const lista = error.detalles.map((d) => `${d.campo}: ${d.mensaje}`).join(" · ");
  return `${error.message}. ${lista}`;
}

// Escapa texto antes de insertarlo con innerHTML (evita XSS)
function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
