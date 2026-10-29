
const DASHBOARD_API_URL = `${API_BASE_URL}/products`;

async function loadDashboard() {
  const totalProducts = document.getElementById("total-products");
  const totalUnits = document.getElementById("total-units");
  const lowStock = document.getElementById("low-stock");
  const inventoryValue = document.getElementById("inventory-value");
  const dashboardTable = document.getElementById("dashboard-products");

  try {
    const response = await fetchConToken(DASHBOARD_API_URL);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos.");
    }

    const products = await response.json();

    // Calcular los indicadores.
    const units = products.reduce(
      (sum, product) => sum + Number(product.quantity || 0),
      0
    );

    const lowStockProducts = products.filter(product =>
      Number(product.quantity || 0) <= Number(product.minStock || 0)
    );

    const value = products.reduce(
      (sum, product) =>
        sum +
        Number(product.quantity || 0) * Number(product.price || 0),
      0
    );

    totalProducts.textContent = products.length;
    totalUnits.textContent = units.toLocaleString("es-ES");
    lowStock.textContent = lowStockProducts.length;

    inventoryValue.textContent = value.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR"
    });

    // Mostrar los productos en la tabla del Dashboard.
    if (products.length === 0) {
      dashboardTable.innerHTML = `
        <tr>
          <td colspan="4">Todavía no hay productos registrados.</td>
        </tr>
      `;
      return;
    }

    dashboardTable.innerHTML = products.map(product => {
      const quantity = Number(product.quantity || 0);
      const minimum = Number(product.minStock || 0);

      let status = "Disponible";
      let badgeClass = "badge-success";

      if (quantity === 0) {
        status = "Agotado";
        badgeClass = "badge-danger";
      } else if (quantity <= minimum) {
        status = "Stock bajo";
        badgeClass = "badge-warning";
      }

      return `
        <tr>
          <td>${escapeDashboardHTML(product.name)}</td>
          <td>${escapeDashboardHTML(product.sku)}</td>
          <td>${quantity}</td>
          <td>
            <span class="badge ${badgeClass}">${status}</span>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    totalProducts.textContent = "—";
    totalUnits.textContent = "—";
    lowStock.textContent = "—";
    inventoryValue.textContent = "—";

    dashboardTable.innerHTML = `
      <tr>
        <td colspan="4">
          No se pudieron cargar los datos. Comprueba que el backend está activo.
        </td>
      </tr>
    `;

    console.error("Error al cargar el Dashboard:", error);
  }
}

function escapeDashboardHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

loadDashboard();
