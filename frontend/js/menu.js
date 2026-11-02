
/* =========================================
   LOOPSTOCK - MENÚ LATERAL COMÚN
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("sidebar-container");

  if (!contenedor) return;

  try {
    const respuesta = await fetch("partials/sidebar.html");

    if (!respuesta.ok) {
      throw new Error(`Error al cargar el menú: ${respuesta.status}`);
    }

    contenedor.innerHTML = await respuesta.text();

    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("menu-close");

    if (!sidebar) return;

    // Activar automáticamente la página actual
    const paginaActual = window.location.pathname.split("/").pop();

    sidebar.querySelectorAll("[data-page]").forEach((link) => {
      const activo = link.dataset.page === paginaActual;

      link.classList.toggle("active", activo);

      if (activo) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const esDesktop = () => window.innerWidth >= 1200;

    function actualizarBoton(abierto) {
      if (!menuToggle) return;

      menuToggle.setAttribute("aria-expanded", String(abierto));
      menuToggle.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
      );
    }

    function abrirMenu() {
      if (esDesktop()) {
        document.body.classList.remove("sidebar-collapsed");
      } else {
        sidebar.classList.add("sidebar-open");
      }

      actualizarBoton(true);
    }

    function cerrarMenu() {
      if (esDesktop()) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        sidebar.classList.remove("sidebar-open");
      }

      actualizarBoton(false);
    }

    menuToggle?.addEventListener("click", () => {
      const abierto = esDesktop()
        ? !document.body.classList.contains("sidebar-collapsed")
        : sidebar.classList.contains("sidebar-open");

      abierto ? cerrarMenu() : abrirMenu();
    });

    menuClose?.addEventListener("click", () => {
      if (!esDesktop()) cerrarMenu();
    });

    sidebar.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (!esDesktop()) cerrarMenu();
      });
    });

    window.addEventListener("resize", () => {
      sidebar.classList.remove("sidebar-open");
      document.body.classList.remove("sidebar-collapsed");
      actualizarBoton(esDesktop());
    });

    actualizarBoton(esDesktop());

    // Aplicar permisos, nombre de usuario y cierre de sesión
    if (typeof aplicarSesionEnPagina === "function") {
      aplicarSesionEnPagina();
    }

  } catch (error) {
    console.error("No se pudo cargar el menú:", error);
  }
});
