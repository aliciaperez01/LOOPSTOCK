
/* =========================================
   LOOPSTOCK - MENÚ LATERAL
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) return;

  const isDesktop = () => window.innerWidth >= 1024;

  function updateButton(isOpen) {
    if (!menuToggle) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );
  }

  function openMenu() {
    if (isDesktop()) {
      document.body.classList.remove("sidebar-collapsed");
    } else {
      sidebar.classList.add("sidebar-open");
    }

    updateButton(true);
  }

  function closeMenu() {
    if (isDesktop()) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      sidebar.classList.remove("sidebar-open");
    }

    updateButton(false);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = isDesktop()
        ? !document.body.classList.contains("sidebar-collapsed")
        : sidebar.classList.contains("sidebar-open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", () => {
      if (!isDesktop()) closeMenu();
    });
  }

  sidebar.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (!isDesktop()) closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    sidebar.classList.remove("sidebar-open");
    document.body.classList.remove("sidebar-collapsed");
    updateButton(isDesktop());
  });

  updateButton(isDesktop());
});
