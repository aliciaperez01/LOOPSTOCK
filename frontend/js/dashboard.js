const numberFormat = new Intl.NumberFormat("es-ES");

const euroFormat = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

function escapeDashboardHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getStockStatus(product) {
  const quantity = Number(product.quantity || 0);
  const minimum = Number(product.minStock || 0);

  if (quantity <= 0) return "out";
  if (quantity <= minimum) return "low";
  return "available";
}

async function loadDashboard() {
  const elements = {
    products: document.getElementById("total-products"),
    units: document.getElementById("total-units"),
    lowStock: document.getElementById("low-stock"),
    value: document.getElementById("inventory-value")
  };

  try {
    const [statsResult, productsResult] = await Promise.allSettled([
      apiFetch("/analytics/summary"),
      apiFetch("/products?page=1&limit=100")
    ]);

    if (statsResult.status === "fulfilled") {
      const stats = statsResult.value;

      elements.products.textContent =
        numberFormat.format(stats.totalProducts);

      elements.units.textContent =
        numberFormat.format(stats.totalUnits);

      elements.lowStock.textContent =
        numberFormat.format(stats.lowStockCount);

      elements.value.textContent =
        euroFormat.format(stats.stockValue);
    } else {
      throw statsResult.reason;
    }

    if (productsResult.status === "fulfilled") {
      const data = productsResult.value;
      const products = Array.isArray(data) ? data : data?.items;

      if (!Array.isArray(products)) {
        throw new Error("No se pudieron cargar los productos.");
      }

      renderInventoryStatus(products);
      renderDashboardAlerts(products);
    } else {
      showDashboardError("dashboard-alerts");
      showDashboardError("status-available");
      showDashboardError("status-low");
      showDashboardError("status-out");
    }
  } catch (error) {
    console.error("Error al cargar el Centro de control:", error);

    Object.values(elements).forEach(element => {
      if (element) element.textContent = "—";
    });

    showDashboardError("dashboard-alerts");
    showDashboardError("status-available");
    showDashboardError("status-low");
    showDashboardError("status-out");
  }

  try {
    const movementsData = await apiFetch("/movements?page=1&limit=5");
    const movements = Array.isArray(movementsData)
      ? movementsData
      : movementsData?.items;

    renderRecentMovements(
      Array.isArray(movements) ? movements : []
    );
  } catch (error) {
    console.error("Error al cargar los movimientos:", error);
    showDashboardError("recent-movements");
  }
}

function showDashboardError(id) {
  const element = document.getElementById(id);
  if (!element) return;

  if (id.startsWith("status-")) {
    element.textContent = "—";
    return;
  }

  element.innerHTML = `
    <p class="dashboard-empty">No se han podido cargar los datos.</p>
  `;
}

function renderInventoryStatus(products) {
  const available = products.filter(
    product => getStockStatus(product) === "available"
  ).length;

  const low = products.filter(
    product => getStockStatus(product) === "low"
  ).length;

  const out = products.filter(
    product => getStockStatus(product) === "out"
  ).length;

  const total = products.length || 1;

  const values = {
    "status-available": available,
    "status-low": low,
    "status-out": out
  };

  const bars = {
    "bar-available": available,
    "bar-low": low,
    "bar-out": out
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = numberFormat.format(value);
    }
  });

  Object.entries(bars).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.style.width = `${(value / total) * 100}%`;
    }
  });
}

function renderDashboardAlerts(products) {
  const container = document.getElementById("dashboard-alerts");
  if (!container) return;

  const alerts = products.filter(
    product => getStockStatus(product) !== "available"
  );

  if (alerts.length === 0) {
    container.innerHTML = `
      <p class="dashboard-empty">No hay alertas de inventario.</p>
    `;
    return;
  }

  container.innerHTML = alerts.slice(0, 5).map(product => {
    const status = getStockStatus(product);
    const label = status === "out" ? "Agotado" : "Stock bajo";

    return `
      <div class="dashboard-alert-item">
        <div>
          <strong>${escapeDashboardHTML(product.name)}</strong>
          <small>${escapeDashboardHTML(product.sku)}</small>
        </div>

        <span class="dashboard-status ${status}">
          ${label}
        </span>
      </div>
    `;
  }).join("");
}

function renderRecentMovements(movements) {
  const container = document.getElementById("recent-movements");
  if (!container) return;

  if (movements.length === 0) {
    container.innerHTML = `
      <p class="dashboard-empty">
        Todavía no hay movimientos registrados.
      </p>
    `;
    return;
  }

  container.innerHTML = movements.map(movement => {
    const entrada = movement.type === "entrada";
    const date = movement.createdAt
      ? new Date(movement.createdAt).toLocaleString("es-ES")
      : "Fecha no disponible";

    return `
      <div class="dashboard-movement-item">
        <span class="movement-icon ${entrada ? "entrada" : "salida"}">
          ${entrada ? "↓" : "↑"}
        </span>

        <div class="movement-description">
          <strong>${escapeDashboardHTML(movement.product?.name || "Producto")}</strong>
          <small>${escapeDashboardHTML(date)}</small>
        </div>

        <span class="movement-quantity ${entrada ? "entrada" : "salida"}">
          ${entrada ? "+" : "−"}${numberFormat.format(movement.quantity)}
        </span>
      </div>
    `;
  }).join("");
}

if (protegerPagina()) {
  loadDashboard();
}