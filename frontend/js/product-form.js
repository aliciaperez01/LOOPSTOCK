
const API_URL = "http://localhost:3001/api/products";

const form = document.getElementById("product-form");
const formMessage = document.getElementById("form-message");
const saveButton = document.getElementById("save-button");

// Detectar si estamos creando o editando un producto.
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Detectar si el formulario está dentro del modal.
const isModal = params.get("modal") === "1";

const pageTitle = document.querySelector(".page-header h1");

// =========================================
// COMUNICACIÓN CON LA PÁGINA DE PRODUCTOS
// =========================================

function notifyParent(type) {
  if (!isModal || window.parent === window) {
    return;
  }

  window.parent.postMessage(
    { type },
    window.location.origin
  );
}

// Adaptar la página cuando se carga dentro del modal.
if (isModal) {
  document.body.classList.add("modal-form");
}

// =========================================
// LEER RESPUESTAS DE LA API
// =========================================

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Ha ocurrido un error."
    );
  }

  return data;
}

// =========================================
// CARGAR PRODUCTO PARA EDITAR
// =========================================

async function loadProduct() {
  if (!productId) {
    return;
  }

  if (pageTitle) {
    pageTitle.textContent = "Editar producto";
  }

  saveButton.textContent = "Guardar cambios";
  formMessage.textContent = "Cargando datos del producto...";

  try {
    const response = await fetch(API_URL);
    const products = await readResponse(response);

    if (!Array.isArray(products)) {
      throw new Error("La API no ha devuelto una lista válida.");
    }

    const product = products.find(item => item._id === productId);

    if (!product) {
      throw new Error("No se ha encontrado el producto.");
    }

    form.elements.name.value = product.name ?? "";
    form.elements.sku.value = product.sku ?? "";
    form.elements.category.value = product.category ?? "";
    form.elements.supplier.value = product.supplier ?? "";
    form.elements.quantity.value = product.quantity ?? 0;
    form.elements.minStock.value = product.minStock ?? 0;
    form.elements.price.value = product.price ?? 0;

    formMessage.textContent = "";

  } catch (error) {
    formMessage.textContent = error.message;
  }
}

// =========================================
// CANCELAR Y CERRAR EL FORMULARIO
// =========================================

const cancelLinks = form.querySelectorAll(
  '.form-actions a[href="products.html"]'
);

cancelLinks.forEach(link => {
  link.addEventListener("click", event => {
    if (!isModal) {
      return;
    }

    event.preventDefault();
    notifyParent("product-form-close");
  });
});

// =========================================
// CREAR O ACTUALIZAR PRODUCTO
// =========================================

form.addEventListener("submit", async event => {
  event.preventDefault();

  formMessage.textContent = "";

  if (!form.reportValidity()) {
    return;
  }

  const formData = new FormData(form);

  const product = {
    name: String(formData.get("name") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    supplier: String(formData.get("supplier") ?? "").trim(),
    quantity: Number(formData.get("quantity")),
    minStock: Number(formData.get("minStock")),
    price: Number(formData.get("price"))
  };

  // Validar los datos antes de enviarlos.
  if (
    !product.name ||
    !product.sku ||
    !product.category ||
    !product.supplier ||
    !Number.isInteger(product.quantity) ||
    !Number.isInteger(product.minStock) ||
    product.quantity < 0 ||
    product.minStock < 0 ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    formMessage.textContent =
      "Revisa los datos. Las cantidades deben ser enteros no negativos y el precio no puede ser negativo.";

    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Guardando...";

  try {
    const isEditing = Boolean(productId);

    const response = await fetch(
      isEditing
        ? `${API_URL}/${encodeURIComponent(productId)}`
        : API_URL,
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      }
    );

    await readResponse(response);

    formMessage.textContent = isEditing
      ? "¡Producto actualizado correctamente!"
      : "¡Producto creado correctamente!";

    // Si estamos en el modal, avisar a la página principal.
    if (isModal) {
      window.setTimeout(() => {
        notifyParent("product-saved");
      }, 700);
    } else {
      // Mantener el comportamiento de la página independiente.
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


loadProduct();
