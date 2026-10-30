/* =========================================
   LOOPSTOCK - MOVIMIENTOS
   ========================================= */

const movementForm = document.getElementById("movement-form");
const productSelect = document.getElementById("movement-product");
const quantityInput = document.getElementById("movement-quantity");
const notesInput = document.getElementById("movement-notes");

const productStockInfo = document.getElementById("product-stock-info");
const movementMessage = document.getElementById("movement-message");
const historyMessage = document.getElementById("history-message");

const movementsTable = document.getElementById("movements-table");
const movementCount = document.getElementById("movement-count");

const saveMovementButton = document.getElementById("save-movement");
const refreshMovementsButton = document.getElementById("refresh-movements");

const searchInput = document.getElementById("movement-search");
const typeFilter = document.getElementById("movement-type-filter");

const previousButton = document.getElementById("movement-prev-page");
const nextButton = document.getElementById("movement-next-page");
const pageInfo = document.getElementById("movement-page-info");

const numberFormatter = new Intl.NumberFormat("es-ES");

let products = [];
let movements = [];

let currentPage = 1;
let totalPages = 1;

const pageSize = 10;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getSelectedType() {
  return movementForm.querySelector('input[name="type"]:checked')?.value;
}

/* =========================================
   CARGAR PRODUCTOS
   ========================================= */

async function loadProducts() {
  productSelect.innerHTML = '<option value="">Cargando productos...</option>';

  try {
    const data = await apiFetch("/products?limit=100");
    products = Array.isArray(data) ? data : data?.items;

    if (!Array.isArray(products)) {
      throw new Error("La API no ha devuelto una lista válida de productos.");
    }

    productSelect.innerHTML = `
      <option value="">Selecciona un producto</option>
      ${products.map(product => `
        <option value="${escapeHTML(product._id)}">
          ${escapeHTML(product.name)} · ${escapeHTML(product.sku)}
        </option>
      `).join("")}
    `;

    updateProductStockInfo();

  } catch (error) {
    productSelect.innerHTML = '<option value="">No se pudieron cargar los productos</option>';
    movementMessage.textContent = mensajeDeError(error);
  }
}

function updateProductStockInfo() {
  const product = products.find(
    item => item._id === productSelect.value
  );

  if (!product) {
    productStockInfo.textContent =
      "Selecciona un producto para consultar su stock.";
    return;
  }

  const stockActual = Number(product.quantity) || 0;
  const cantidad = Number(quantityInput.value);
  const tipo = getSelectedType();

  let mensaje = `Stock actual: ${numberFormatter.format(stockActual)} unidades.`;

  if (!tipo) {
    mensaje += " Selecciona entrada o salida.";
  } else if (
    quantityInput.value.trim() !== "" &&
    Number.isInteger(cantidad) &&
    cantidad > 0
  ) {
    const stockResultante =
      tipo === "entrada"
        ? stockActual + cantidad
        : stockActual - cantidad;

    mensaje += ` Stock después del movimiento: ${numberFormatter.format(stockResultante)} unidades.`;

    if (tipo === "salida" && cantidad > stockActual) {
      mensaje += " ¡Atención! No hay stock suficiente.";
    }
  }

  productStockInfo.textContent = mensaje;
}

/* =========================================
   REGISTRAR MOVIMIENTO
   ========================================= */

async function registerMovement(event) {
  event.preventDefault();

  movementMessage.textContent = "";

  const productId = productSelect.value;
  const type = getSelectedType();
  const quantity = Number(quantityInput.value);
  const notes = notesInput.value.trim();

  if (!productId) {
    movementMessage.textContent = "Selecciona un producto.";
    productSelect.focus();
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    movementMessage.textContent =
      "Introduce una cantidad entera mayor que cero.";
    quantityInput.focus();
    return;
  }

  const product = products.find(item => item._id === productId);

  if (!product) {
    movementMessage.textContent = "El producto seleccionado ya no está disponible.";
    return;
  }

  if (type === "salida" && quantity > Number(product.quantity)) {
    movementMessage.textContent =
      "No hay suficientes unidades disponibles para realizar esta salida.";
    quantityInput.focus();
    return;
  }

  saveMovementButton.disabled = true;
  saveMovementButton.textContent = "Registrando...";

  try {
    await apiFetch("/movements", {
      method: "POST",
      body: {
        product: productId,
        type,
        quantity,
        notes
      }
    });

    movementMessage.textContent =
      type === "entrada"
        ? "Entrada registrada correctamente."
        : "Salida registrada correctamente.";

    movementMessage.classList.add("message-success");

    movementForm.reset();

    currentPage = 1;

    await Promise.all([
      loadProducts(),
      loadMovements()
    ]);

  } catch (error) {
    movementMessage.textContent = mensajeDeError(error);
    movementMessage.classList.remove("message-success");
  } finally {
    saveMovementButton.disabled = false;
    saveMovementButton.textContent = "Registrar movimiento";
  }
}

/* =========================================
   CARGAR HISTORIAL
   ========================================= */

async function loadMovements() {
  historyMessage.textContent = "";

  movementsTable.innerHTML = `
    <tr><td colspan="7">Cargando movimientos...</td></tr>
  `;

  refreshMovementsButton.disabled = true;

  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: pageSize
    });

    if (typeFilter.value) {
      params.set("type", typeFilter.value);
    }

    // Buscar por nombre o SKU del producto
    const search = searchInput.value.trim();

    if (search) {
      params.set("search", search);
    }

    const data = await apiFetch(`/movements?${params.toString()}`);

    if (!Array.isArray(data?.items)) {
      throw new Error("La API no ha devuelto un historial válido.");
    }

    movements = data.items;
    currentPage = Number(data.page) || 1;
    totalPages = Math.max(1, Number(data.pages) || 1);

    renderMovements();
    updateMovementPagination();

  } catch (error) {
    movementsTable.innerHTML = `
      <tr><td colspan="7">No se pudo cargar el historial.</td></tr>
    `;

    movementCount.textContent = "Error al cargar el historial";
    historyMessage.textContent = mensajeDeError(error);

  } finally {
    refreshMovementsButton.disabled = false;
  }
}

/* =========================================
   MOSTRAR MOVIMIENTOS
   ========================================= */

function renderMovements() {
  const search = searchInput.value.trim().toLowerCase();

  const filteredMovements = movements.filter(movement => {
    const productName = movement.product?.name ?? "";
    const productSku = movement.product?.sku ?? "";

    const matchesSearch =
      productName.toLowerCase().includes(search) ||
      productSku.toLowerCase().includes(search);

    return matchesSearch;
  });

  movementCount.textContent =
    `${filteredMovements.length} movimiento(s) en esta página`;

  if (filteredMovements.length === 0) {
    movementsTable.innerHTML = `
      <tr>
        <td colspan="7">No hay movimientos que coincidan con la búsqueda.</td>
      </tr>
    `;
    return;
  }

  movementsTable.innerHTML = filteredMovements.map(movement => {
    const isEntry = movement.type === "entrada";

    const typeLabel = isEntry ? "Entrada" : "Salida";
    const typeClass = isEntry ? "movement-badge-entry" : "movement-badge-exit";
    const sign = isEntry ? "+" : "−";

    const productName = movement.product?.name || "Producto eliminado";
    const productSku = movement.product?.sku || "—";
    const responsible = movement.user?.name || movement.user?.email || "—";

    return `
      <tr>
        <td>${escapeHTML(formatDate(movement.createdAt))}</td>
        <td class="movement-product-name">${escapeHTML(productName)}</td>
        <td>${escapeHTML(productSku)}</td>
        <td>
          <span class="movement-badge ${typeClass}">
            ${typeLabel}
          </span>
        </td>
        <td class="${isEntry ? "movement-quantity-entry" : "movement-quantity-exit"}">
          ${sign}${numberFormatter.format(Number(movement.quantity) || 0)}
        </td>
        <td>${escapeHTML(responsible)}</td>
        <td class="movement-notes-cell">${escapeHTML(movement.notes || "—")}</td>
      </tr>
    `;
  }).join("");
}

/* =========================================
   PAGINACIÓN
   ========================================= */

function updateMovementPagination() {
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

  previousButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
}

/* =========================================
   EVENTOS
   ========================================= */

movementForm.addEventListener("submit", registerMovement);

productSelect.addEventListener("change", updateProductStockInfo);

movementForm.querySelectorAll('input[name="type"]').forEach(input => {
  input.addEventListener("change", updateProductStockInfo);
});

quantityInput.addEventListener("input", updateProductStockInfo);

movementForm.addEventListener("reset", () => {
  setTimeout(updateProductStockInfo, 0);
  movementMessage.textContent = "";
  movementMessage.classList.remove("message-success");
});

refreshMovementsButton.addEventListener("click", () => {
  loadMovements();
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  loadMovements();
});

typeFilter.addEventListener("change", () => {
  currentPage = 1;
  loadMovements();
});

previousButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadMovements();
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadMovements();
  }
});

/* =========================================
   INICIO
   ========================================= */

async function initMovementsPage() {
  await Promise.all([
    loadProducts(),
    loadMovements()
  ]);
}

initMovementsPage();