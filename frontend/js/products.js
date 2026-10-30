
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

// Elementos del modal
const productModal = document.getElementById("product-modal");
const productModalFrame = document.getElementById("product-modal-frame");
const closeProductModalButton = document.getElementById("close-product-modal");

// Estadísticas
const statProducts = document.getElementById("stat-products");
const statUnits = document.getElementById("stat-units");
const statValue = document.getElementById("stat-value");
const statLowStock = document.getElementById("stat-low-stock");

let products = [];

let currentPage = 1;
let totalPages = 1;
let totalProducts = 0;
const pageSize = 10;

// Elementos de paginación
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

const numberFormatter = new Intl.NumberFormat("es-ES");

const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});


async function loadProducts() {
  message.textContent = "";
  productsTable.innerHTML =
    `<tr><td colspan="8">Cargando productos...</td></tr>`;

  refreshButton.disabled = true;

  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: pageSize
    });

    const search = productSearch.value.trim();
    const category = categoryFilter.value;
    const stock = stockFilter.value;

    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (stock) params.set("stock", stock);

    const data = await apiFetch(`/products?${params.toString()}`);

    const lista = Array.isArray(data) ? data : data?.items;

    if (!Array.isArray(lista)) {
      throw new Error("La API no ha devuelto una lista válida.");
    }

    products = lista;

    if (!Array.isArray(data)) {
      currentPage = Number(data.page) || currentPage;
      totalPages = Number(data.pages) || 1;
      totalProducts = Number(data.total) || 0;
    } else {
      totalProducts = lista.length;
      totalPages = 1;
      currentPage = 1;
    }

    await updateCategoryOptions();
    await updateStatistics();

    renderProducts();
    updatePagination();

  } catch (error) {
    productsTable.innerHTML =
      `<tr><td colspan="8">No se pudieron cargar los productos.</td></tr>`;

    productCount.textContent = "Error al cargar los productos";
    message.textContent = error.message;

    statProducts.textContent = "—";
    statUnits.textContent = "—";
    statValue.textContent = "—";
    statLowStock.textContent = "—";

  } finally {
    refreshButton.disabled = false;
    updatePagination();
  }
}

function updatePagination() {
  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  }

  if (prevPageButton) {
    prevPageButton.disabled = currentPage <= 1;
  }

  if (nextPageButton) {
    nextPageButton.disabled = currentPage >= totalPages;
  }
}

function getStockStatus(product) {
  const quantity = Number(product.quantity ?? 0);
  const minimum = Number(product.minStock ?? 0);

  if (quantity <= 0) return "out";
  if (quantity <= minimum) return "low";
  return "available";
}

function getStockLabel(status) {
  return ({
    available: "Disponible",
    low: "Stock bajo",
    out: "Agotado"
  })[status] || "Sin estado";
}

function getStockClass(status) {
  return ({
    available: "badge-success",
    low: "badge-warning",
    out: "badge-danger"
  })[status] || "";
}


async function updateStatistics() {
  try {
    const stats = await apiFetch("/products/stats");

    statProducts.textContent = numberFormatter.format(
      stats.totalProducts
    );

    statUnits.textContent = numberFormatter.format(
      stats.totalUnits
    );

    statValue.textContent = euroFormatter.format(
      stats.inventoryValue
    );

    statLowStock.textContent = numberFormatter.format(
      stats.lowStock
    );
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);

    statProducts.textContent = "—";
    statUnits.textContent = "—";
    statValue.textContent = "—";
    statLowStock.textContent = "—";
  }
}


async function updateCategoryOptions() {
  const selectedCategory = categoryFilter.value;

  try {
    const categories = await apiFetch("/products/categories");

    if (!Array.isArray(categories)) {
      throw new Error("No se pudieron obtener las categorías.");
    }

    categoryFilter.innerHTML = `
      <option value="">Todas las categorías</option>
      ${categories
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es"))
        .map(category => `
          <option value="${escapeHTML(category)}">${escapeHTML(category)}</option>
        `).join("")}
    `;

    categoryFilter.value = selectedCategory;

  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

function renderProducts() {
  productCount.textContent =
    `${numberFormatter.format(totalProducts)} producto(s) encontrado(s)`;

  if (products.length === 0) {
    productsTable.innerHTML = `
      <tr><td colspan="8">No se encontraron productos con estos filtros.</td></tr>
    `;
    return;
  }

  productsTable.innerHTML = products.map(product => {
    const quantity = Number(product.quantity ?? 0);
    const status = getStockStatus(product);
    const numericPrice = Number(product.price);

    const hasValidPrice =
      product.price !== null &&
      product.price !== undefined &&
      String(product.price).trim() !== "" &&
      Number.isFinite(numericPrice) &&
      numericPrice >= 0;

    const price = hasValidPrice ? euroFormatter.format(numericPrice) : "—";
    const editUrl = `product-form.html?id=${encodeURIComponent(product._id)}`;

    return `
      <tr>
        <td>${escapeHTML(product.name)}</td>
        <td>${escapeHTML(product.sku)}</td>
        <td>${escapeHTML(product.category)}</td>
        <td>${numberFormatter.format(quantity)}</td>
        <td>${price}</td>
        <td>${escapeHTML(product.supplier || "—")}</td>
        <td>
          <span class="badge ${getStockClass(status)}">${getStockLabel(status)}</span>
        </td>
        <td>
          <div class="product-actions">
            <a href="${editUrl}" class="btn btn-secondary"
               aria-label="Editar ${escapeHTML(product.name)}">✎ Editar</a>
            <button type="button" class="btn btn-danger"
                    data-delete-id="${escapeHTML(product._id)}"
                    data-delete-name="${escapeHTML(product.name)}">
              🗑 Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function openProductModal() {
  if (!productModal || !productModalFrame) return;

  productModal.hidden = false;
  document.body.style.overflow = "hidden";
  productModalFrame.src = "product-form.html?modal=1";

  if (closeProductModalButton) closeProductModalButton.focus();
}

function closeProductModal() {
  if (!productModal || !productModalFrame) return;

  productModal.hidden = true;
  productModalFrame.src = "about:blank";
  document.body.style.overflow = "";

  if (addProductButton) addProductButton.focus();
}

if (addProductButton) {
  addProductButton.addEventListener("click", openProductModal);
}

if (closeProductModalButton) {
  closeProductModalButton.addEventListener("click", closeProductModal);
}

if (productModal) {
  productModal.addEventListener("click", event => {
    if (event.target === productModal) closeProductModal();
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && productModal && !productModal.hidden) {
    closeProductModal();
  }
});

window.addEventListener("message", event => {
  if (event.origin !== window.location.origin) return;

  if (event.data?.type === "product-form-close") {
    closeProductModal();
  }

  if (event.data?.type === "product-saved") {
    closeProductModal();
    loadProducts();
  }
});

productSearch.addEventListener("input", () => {
  currentPage = 1;
  loadProducts();
});

categoryFilter.addEventListener("change", () => {
  currentPage = 1;
  loadProducts();
});

stockFilter.addEventListener("change", () => {
  currentPage = 1;
  loadProducts();
});

// Actualizar productos
refreshButton.addEventListener("click", () => {
  loadProducts();
});


// Paginación
function scrollToProducts() {
  const productSection = productsTable.closest(".product-list-card");

  if (productSection) {
    productSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

prevPageButton.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    await loadProducts();
    scrollToProducts();
  }
});

nextPageButton.addEventListener("click", async () => {
  if (currentPage < totalPages) {
    currentPage++;
    await loadProducts();
    scrollToProducts();
  }
});


clearFiltersButton.addEventListener("click", () => {
  productSearch.value = "";
  categoryFilter.value = "";
  stockFilter.value = "";
  currentPage = 1;
  loadProducts();
});

productsTable.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;

  const productId = button.dataset.deleteId;
  const productName = button.dataset.deleteName;

  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Eliminando...";

  try {
    await apiFetch(`/products/${encodeURIComponent(productId)}`, {
      method: "DELETE"
    });

    message.textContent = "Producto eliminado correctamente.";
    await loadProducts();
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
    button.textContent = "🗑 Eliminar";
  }
});

loadProducts();
