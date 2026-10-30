
const API_URL = `${API_BASE_URL}/products`;

const form = document.getElementById("product-form");
const formMessage = document.getElementById("form-message");
const saveButton = document.getElementById("save-button");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const isModal = params.get("modal") === "1";
const pageTitle = document.querySelector(".page-header h1");

function notifyParent(type) {
  if (!isModal || window.parent === window) return;
  window.parent.postMessage({ type }, window.location.origin);
}

if (isModal) document.body.classList.add("modal-form");

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Ha ocurrido un error.");
  }
  return data;
}

function populateCategories(products, selectedCategory = "") {
  const categorySelect = form.elements.namedItem("category");

  const categories = [
    ...new Set(
      products
        .map(product => String(product.category || "").trim())
        .filter(category => category && category.toLowerCase() !== "audio")
    )
  ].sort((a, b) => a.localeCompare(b, "es"));

  categorySelect.replaceChildren(
    new Option("Selecciona una categoría", "")
  );

  categories.forEach(category => {
    categorySelect.add(new Option(category, category));
  });

  if (
    selectedCategory &&
    selectedCategory.toLowerCase() !== "audio" &&
    !categories.includes(selectedCategory)
  ) {
    categorySelect.add(new Option(selectedCategory, selectedCategory));
  }

  categorySelect.value =
    selectedCategory && selectedCategory.toLowerCase() !== "audio"
      ? selectedCategory
      : "";
}

async function loadCategories(selectedCategory = "") {
  const response = await fetchConToken(API_URL);
  const products = await readResponse(response);

  if (!Array.isArray(products)) {
    throw new Error("La API no ha devuelto una lista válida.");
  }

  populateCategories(products, selectedCategory);
}

async function loadProduct() {
  if (!productId) return;

  if (pageTitle) pageTitle.textContent = "Editar producto";
  saveButton.textContent = "Guardar cambios";
  formMessage.textContent = "Cargando datos del producto...";

  try {
    const response = await fetchConToken(API_URL);
    const products = await readResponse(response);

    if (!Array.isArray(products)) {
      throw new Error("La API no ha devuelto una lista válida.");
    }

    const product = products.find(item => item._id === productId);

    if (!product) {
      throw new Error("No se ha encontrado el producto.");
    }

    populateCategories(products, product.category ?? "");

    form.elements.name.value = product.name ?? "";
    form.elements.sku.value = product.sku ?? "";
    form.elements.supplier.value = product.supplier ?? "";
    form.elements.quantity.value = product.quantity ?? 0;
    form.elements.minStock.value = product.minStock ?? 0;
    form.elements.price.value = product.price ?? 0;
    form.elements.description.value = product.description ?? "";
    form.elements.cost.value = product.cost ?? 0;
    form.elements.status.value = product.status ?? "active";

    formMessage.textContent = "";
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

form.querySelectorAll('.form-actions a[href="products.html"]')
  .forEach(link => {
    link.addEventListener("click", event => {
      if (!isModal) return;
      event.preventDefault();
      notifyParent("product-form-close");
    });
  });

form.addEventListener("submit", async event => {
  event.preventDefault();
  formMessage.textContent = "";

  if (!form.reportValidity()) return;

  const formData = new FormData(form);

  const product = {
    name: String(formData.get("name") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    supplier: String(formData.get("supplier") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    cost: Number(formData.get("cost") || 0),
    status: String(formData.get("status") ?? "active"),
    quantity: Number(formData.get("quantity")),
    minStock: Number(formData.get("minStock")),
    price: Number(formData.get("price"))
  };

  if (
    !product.name ||
    !product.sku ||
    !product.category ||
    product.category.toLowerCase() === "audio" ||
    !product.supplier ||
    !Number.isInteger(product.quantity) ||
    !Number.isInteger(product.minStock) ||
    product.quantity < 0 ||
    product.minStock < 0 ||
    !Number.isFinite(product.price) ||
    product.price < 0 ||
    !Number.isFinite(product.cost) ||
    product.cost < 0 ||
    !["active", "inactive"].includes(product.status)
  ) {
    formMessage.textContent =
      "Revisa los datos. Selecciona una categoría válida; las cantidades deben ser enteros no negativos y los precios y costes no pueden ser negativos.";
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Guardando...";

  try {
    const isEditing = Boolean(productId);

    const response = await fetchConToken(
      isEditing ? `${API_URL}/${encodeURIComponent(productId)}` : API_URL,
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      }
    );

    await readResponse(response);

    formMessage.textContent = isEditing
      ? "¡Producto actualizado correctamente!"
      : "¡Producto creado correctamente!";

    if (isModal) {
      window.setTimeout(() => notifyParent("product-saved"), 700);
    } else {
      window.setTimeout(() => {
        window.location.href = "products.html";
      }, 1000);
    }
  } catch (error) {
    formMessage.textContent = error.message;
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = productId
      ? "Guardar cambios"
      : "Guardar producto";
  }
});

async function initializeForm() {
  try {
    if (productId) {
      await loadProduct();
    } else {
      await loadCategories();
    }
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

initializeForm();

