
const API_URL = `${API_BASE_URL}/products`;

// Elementos de la página
const productsTable = document.getElementById("products-table");
const productCount = document.getElementById("product-count");
const productSearch = document.getElementById("product-search");
const categoryFilter = document.getElementById("category-filter");
const stockFilter = document.getElementById("stock-filter");
const clearFiltersButton = document.getElementById("clear-filters");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refresh-button");
const addProductButton = document.getElementById("add-product-button");

// Elementos de la ventana modal
const productModal = document.getElementById("product-modal");
const productModalFrame = document.getElementById("product-modal-frame");
const closeProductModalButton = document.getElementById("close-product-modal");

// Tarjetas de estadísticas
const statProducts = document.getElementById("stat-products");
const statUnits = document.getElementById("stat-units");
const statValue = document.getElementById("stat-value");
const statLowStock = document.getElementById("stat-low-stock");

// Datos
let products = [];

const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

const numberFormatter = new Intl.NumberFormat("es-ES");

// =========================================
// CARGAR PRODUCTOS DESDE LA API
// =========================================

async function loadProducts() {
  message.textContent = "";

  productsTable.innerHTML = `
    <tr>
      <td colspan="8">Cargando productos...</td>
    </tr>
  `;

  refreshButton.disabled = true;

  try {
    const response = await fetchConToken(API_URL);

    if (!response.ok) {
      throw new Error("No se pudieron obtener los productos.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("La API no ha devuelto una lista válida.");
    }

    products = data;

    updateCategoryOptions();
    updateStatistics();
    renderProducts();

  } catch (error) {
    productsTable.innerHTML = `
      <tr>
        <td colspan="8">
          No se pudieron cargar los productos.
          Comprueba que el backend está funcionando.
        </td>
      </tr>
    `;

    productCount.textContent = "Error al cargar los productos";
    message.textContent = error.message;

    statProducts.textContent = "—";
    statUnits.textContent = "—";
    statValue.textContent = "—";
    statLowStock.textContent = "—";

  } finally {
    refreshButton.disabled = false;
  }
}

// =========================================
// ESTADO DEL STOCK
// =========================================

function getStockStatus(product) {
  const quantity = Number(product.quantity ?? 0);
  const minimum = Number(product.minStock ?? 0);

  if (quantity <= 0) {
    return "out";
  }

  if (quantity <= minimum) {
    return "low";
  }

  return "available";
}

function getStockLabel(status) {
  const labels = {
    available: "Disponible",
    low: "Stock bajo",
    out: "Agotado"
  };

  return labels[status] || "Sin estado";
}

function getStockClass(status) {
  const classes = {
    available: "badge-success",
    low: "badge-warning",
    out: "badge-danger"
  };

  return classes[status] || "";
}

// =========================================
// ACTUALIZAR ESTADÍSTICAS
// =========================================

function updateStatistics() {
  const totalProducts = products.length;

  const totalUnits = products.reduce((total, product) => {
    return total + Math.max(
      0,
      Number(product.quantity) || 0
    );
  }, 0);

  const inventoryValue = products.reduce((total, product) => {
    const quantity = Math.max(
      0,
      Number(product.quantity) || 0
    );

    const rawPrice = product.price;
    const price = Number(rawPrice);

    if (
      rawPrice === null ||
      rawPrice === undefined ||
      String(rawPrice).trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return total;
    }

    return total + quantity * price;
  }, 0);

  const productsNeedingAttention = products.filter(product => {
    return getStockStatus(product) !== "available";
  }).length;

  statProducts.textContent =
    numberFormatter.format(totalProducts);

  statUnits.textContent =
    numberFormatter.format(totalUnits);

  statValue.textContent =
    euroFormatter.format(inventoryValue);

  statLowStock.textContent =
    numberFormatter.format(productsNeedingAttention);
}

// =========================================
// FILTRO DE CATEGORÍAS
// =========================================

function updateCategoryOptions() {
  const selectedCategory = categoryFilter.value;

  const categories = [
    ...new Set(
      products
        .map(product => String(product.category ?? "").trim())
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, "es"));

  categoryFilter.innerHTML = `
    <option value="">Todas las categorías</option>
    ${categories.map(category => `
      <option value="${escapeHTML(category)}">
        ${escapeHTML(category)}
      </option>
    `).join("")}
  `;

  if (categories.includes(selectedCategory)) {
    categoryFilter.value = selectedCategory;
  }
}

// =========================================
// MOSTRAR Y FILTRAR PRODUCTOS
// =========================================

function renderProducts() {
  const search = productSearch.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedStock = stockFilter.value;

  const filteredProducts = products.filter(product => {
    const matchesSearch = [
      product.name,
      product.sku,
      product.category,
      product.supplier
    ].some(value =>
      String(value ?? "").toLowerCase().includes(search)
    );

    const matchesCategory =
      !selectedCategory ||
      String(product.category ?? "") === selectedCategory;

    const matchesStock =
      !selectedStock ||
      getStockStatus(product) === selectedStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  productCount.textContent =
    `${filteredProducts.length} de ${products.length} producto(s)`;

  if (filteredProducts.length === 0) {
    productsTable.innerHTML = `
      <tr>
        <td colspan="8">
          No se encontraron productos con estos filtros.
        </td>
      </tr>
    `;
    return;
  }

  productsTable.innerHTML = filteredProducts.map(product => {
    const quantity = Number(product.quantity ?? 0);
    const status = getStockStatus(product);

    const rawPrice = product.price;
    const numericPrice = Number(rawPrice);

    const hasValidPrice =
      rawPrice !== null &&
      rawPrice !== undefined &&
      String(rawPrice).trim() !== "" &&
      Number.isFinite(numericPrice) &&
      numericPrice >= 0;

    const price = hasValidPrice
      ? euroFormatter.format(numericPrice)
      : "—";

    const editUrl =
      `product-form.html?id=${encodeURIComponent(product._id)}`;

    return `
      <tr>
        <td>${escapeHTML(product.name)}</td>
        <td>${escapeHTML(product.sku)}</td>
        <td>${escapeHTML(product.category)}</td>
        <td>${numberFormatter.format(quantity)}</td>
        <td>${price}</td>
        <td>${escapeHTML(product.supplier || "—")}</td>
        <td>
          <span class="badge ${getStockClass(status)}">
            ${getStockLabel(status)}
          </span>
        </td>
        <td>
          <div class="product-actions">
            <a
              href="${editUrl}"
              class="btn btn-secondary"
              aria-label="Editar ${escapeHTML(product.name)}"
            >
              ✎ Editar
            </a>

            <button
              type="button"
              class="btn btn-danger"
              data-delete-id="${escapeHTML(product._id)}"
              data-delete-name="${escapeHTML(product.name)}"
            >
              🗑 Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// =========================================
// EVITAR INYECCIÓN DE HTML
// =========================================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// =========================================
// ABRIR Y CERRAR EL MODAL
// =========================================

function openProductModal() {
  if (!productModal || !productModalFrame) {
    return;
  }

  productModal.hidden = false;
  document.body.style.overflow = "hidden";

  // Cargar el formulario existente dentro del modal.
  productModalFrame.src = "product-form.html?modal=1";

  closeProductModalButton.focus();
}

function closeProductModal() {
  if (!productModal || !productModalFrame) {
    return;
  }

  productModal.hidden = true;
  productModalFrame.src = "about:blank";
  document.body.style.overflow = "";

  if (addProductButton) {
    addProductButton.focus();
  }
}

// Abrir al pulsar Añadir producto.
if (addProductButton) {
  addProductButton.addEventListener("click", openProductModal);
}

// Cerrar al pulsar la X.
if (closeProductModalButton) {
  closeProductModalButton.addEventListener("click", closeProductModal);
}

// Cerrar al pulsar fuera de la ventana.
if (productModal) {
  productModal.addEventListener("click", event => {
    if (event.target === productModal) {
      closeProductModal();
    }
  });
}

// Cerrar con Escape.
document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    productModal &&
    !productModal.hidden
  ) {
    closeProductModal();
  }
});

// Recibir avisos del formulario cargado en el iframe.
window.addEventListener("message", event => {
  // Solo aceptar mensajes de la misma página de origen.
  if (event.origin !== window.location.origin) {
    return;
  }

  if (event.data?.type === "product-form-close") {
    closeProductModal();
  }

  if (event.data?.type === "product-saved") {
    closeProductModal();
    loadProducts();
  }
});

// =========================================
// EVENTOS DE BÚSQUEDA Y FILTROS
// =========================================

productSearch.addEventListener("input", renderProducts);

categoryFilter.addEventListener("change", renderProducts);

stockFilter.addEventListener("change", renderProducts);

refreshButton.addEventListener("click", loadProducts);

clearFiltersButton.addEventListener("click", () => {
  productSearch.value = "";
  categoryFilter.value = "";
  stockFilter.value = "";

  renderProducts();
});

// =========================================
// ELIMINAR PRODUCTOS
// =========================================

productsTable.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete-id]");

  if (!button) {
    return;
  }

  const productId = button.dataset.deleteId;
  const productName = button.dataset.deleteName;

  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar "${productName}"? ` +
    "Esta acción no se puede deshacer."
  );

  if (!confirmed) {
    return;
  }

  button.disabled = true;
  button.textContent = "Eliminando...";

  try {
    const response = await fetchConToken(
      `${API_URL}/${encodeURIComponent(productId)}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));

      throw new Error(
        result.message ||
        result.error ||
        "No se pudo eliminar el producto."
      );
    }

    message.textContent = "Producto eliminado correctamente.";

    await loadProducts();

  } catch (error) {
    message.textContent = error.message;

    button.disabled = false;
    button.textContent = "🗑 Eliminar";
  }
});

// =========================================
// INICIAR LA PÁGINA
// =========================================

loadProducts();
