/* =========================================
   LOOPSTOCK - CONFIGURACIÓN
   ========================================= */

// URL de la API según dónde se abra el frontend:
// - En local (Live Server, localhost o 127.0.0.1) → backend local.
// - En Render (Static Site) → backend desplegado en Render.
// Al crear el Web Service en Render, sustituye API_PRODUCCION por su URL real.
const API_LOCAL = "http://localhost:3001/api";
const API_PRODUCCION = "https://loopstock.onrender.com/api";

const ES_LOCAL = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const API_BASE_URL = ES_LOCAL ? API_LOCAL : API_PRODUCCION;

// Claves de localStorage para la sesión
const TOKEN_KEY = "loopstock-token";
const USER_KEY = "loopstock-user";
