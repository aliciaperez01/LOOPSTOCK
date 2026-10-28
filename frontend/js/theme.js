
/* =========================================
   LOOPSTOCK - GESTIÓN DEL TEMA
   ========================================= */

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

const THEME_KEY = "loopstock-theme";

// Iconos SVG lineales
const sunIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.42 1.42"></path>
    <path d="m17.65 17.65 1.42 1.42"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m4.93 19.07 1.42-1.42"></path>
    <path d="m17.65 6.35 1.42-1.42"></path>
  </svg>
`;

const moonIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"></path>
  </svg>
`;

// Aplicar el tema y actualizar la interfaz
function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);

  if (themeIcon && themeLabel && themeToggle) {
    themeIcon.innerHTML = isDark ? sunIcon : moonIcon;
    themeLabel.textContent = isDark ? "Modo claro" : "Modo oscuro";

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
    );
  }
}

// Cargar el tema guardado
applyTheme(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");

// Cambiar de tema al pulsar el botón
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    const theme = isDark ? "dark" : "light";

    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);

    // Sincronizar el formulario si está abierto en un iframe
    document.querySelectorAll("iframe").forEach((frame) => {
      try {
        frame.contentWindow?.postMessage(
          { type: "loopstock-theme-change", theme },
          window.location.origin
        );
      } catch (error) {
        // Ignorar iframes de otros orígenes
      }
    });
  });
}

// Recibir cambios de tema desde la página principal
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;

  if (event.data?.type === "loopstock-theme-change") {
    applyTheme(event.data.theme);
  }
});

// Actualizar el tema si cambia en otra página de la misma aplicación
window.addEventListener("storage", (event) => {
  if (event.key === THEME_KEY) {
    applyTheme(event.newValue === "dark" ? "dark" : "light");
  }
});
