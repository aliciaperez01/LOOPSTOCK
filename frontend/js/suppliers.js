/* =========================================
   LOOPSTOCK - PROVEEDORES
   Requiere: config.js, api.js, auth.js
   ========================================= */

// Elementos de la página
const suppliersTable = document.getElementById("suppliers-table");
const supplierCount = document.getElementById("supplier-count");
const supplierSearch = document.getElementById("supplier-search");
const activeFilter = document.getElementById("active-filter");
const filtersForm = document.getElementById("supplier-filters");
const refreshButton = document.getElementById("refresh-button");
const message = document.getElementById("message");
const addSupplierButton = document.getElementById("add-supplier-button");

// Modal y formulario
const supplierModal = document.getElementById("supplier-modal");
const supplierModalTitle = document.getElementById("supplier-modal-title");
const supplierForm = document.getElementById("supplier-form");
const formMessage = document.getElementById("form-message");
const saveButton = document.getElementById("save-supplier");

const CAMPOS = ["name", "taxId", "contactName", "email", "phone", "website", "notes"];
const COLUMNAS = esAdmin() ? 7 : 6;

let suppliers = [];
let editingId = null;
let elementoConFoco = null;

// =========================================
// CARGAR PROVEEDORES (la búsqueda la hace la API)
// =========================================

async function loadSuppliers() {
  message.textContent = "";
  refreshButton.disabled = true;

  const params = new URLSearchParams();
  if (supplierSearch.value.trim()) params.set("search", supplierSearch.value.trim());
  if (activeFilter.value) params.set("active", activeFilter.value);

  try {
    suppliers = await apiFetch(`/suppliers?${params}`);
    renderSuppliers();
  } catch (error) {
    suppliersTable.innerHTML = `<tr><td colspan="${COLUMNAS}">No se pudieron cargar los proveedores.</td></tr>`;
    supplierCount.textContent = "Error al cargar los proveedores";
    mostrarMensaje(message, mensajeDeError(error), "error");
  } finally {
    refreshButton.disabled = false;
  }
}

// =========================================
// PINTAR LA TABLA
// =========================================

function renderSuppliers() {
  supplierCount.textContent = `${suppliers.length} proveedor(es)`;

  if (suppliers.length === 0) {
    suppliersTable.innerHTML = `<tr><td colspan="${COLUMNAS}">No hay proveedores con estos filtros.</td></tr>`;
    return;
  }

  suppliersTable.innerHTML = suppliers.map((s) => {
    const estado = s.active
      ? '<span class="badge badge-success">Activo</span>'
      : '<span class="badge badge-danger">Inactivo</span>';

    const acciones = esAdmin()
      ? `
        <td>
          <div class="gestion-actions">
            <button type="button" class="btn btn-secondary" data-edit-id="${escaparHtml(s._id)}">
              ✎ Editar
            </button>
            ${s.active ? `
              <button type="button" class="btn btn-danger"
                data-deactivate-id="${escaparHtml(s._id)}"
                data-deactivate-name="${escaparHtml(s.name)}">
                Desactivar
              </button>` : ""}
          </div>
        </td>`
      : "";

    return `
      <tr>
        <td><strong>${escaparHtml(s.name)}</strong></td>
        <td>${escaparHtml(s.taxId || "—")}</td>
        <td>${escaparHtml(s.contactName || "—")}</td>
        <td>${s.email ? `<a href="mailto:${escaparHtml(s.email)}">${escaparHtml(s.email)}</a>` : "—"}</td>
        <td>${escaparHtml(s.phone || "—")}</td>
        <td>${estado}</td>
        ${acciones}
      </tr>
    `;
  }).join("");
}

function mostrarMensaje(elemento, texto, tipo = "") {
  elemento.textContent = texto;
  elemento.dataset.tipo = tipo;
}

// =========================================
// MODAL: CREAR Y EDITAR
// =========================================

function abrirModal(proveedor = null) {
  elementoConFoco = document.activeElement;
  editingId = proveedor?._id || null;
  supplierModalTitle.textContent = proveedor ? "Editar proveedor" : "Añadir proveedor";

  supplierForm.reset();
  mostrarMensaje(formMessage, "");
  if (proveedor) {
    CAMPOS.forEach((campo) => {
      supplierForm[campo].value = proveedor[campo] || "";
    });
  }

  supplierModal.hidden = false;
  supplierForm.name.focus();
}

function cerrarModal() {
  supplierModal.hidden = true;
  editingId = null;
  elementoConFoco?.focus();
}

// Validación en el navegador con las mismas reglas que el modelo
function validarFormulario(datos) {
  if (datos.name.length < 2) return "El nombre debe tener al menos 2 caracteres.";
  if (datos.taxId && !/^[A-Z0-9]{8,12}$/i.test(datos.taxId)) return "El CIF/NIF no es válido.";
  if (datos.email && !/^\S+@\S+\.\S+$/.test(datos.email)) return "El email no es válido.";
  return null;
}

supplierForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {};
  CAMPOS.forEach((campo) => {
    datos[campo] = supplierForm[campo].value.trim();
  });

  const errorLocal = validarFormulario(datos);
  if (errorLocal) {
    mostrarMensaje(formMessage, errorLocal, "error");
    return;
  }

  saveButton.disabled = true;

  try {
    if (editingId) {
      await apiFetch(`/suppliers/${encodeURIComponent(editingId)}`, { method: "PUT", body: datos });
    } else {
      await apiFetch("/suppliers", { method: "POST", body: datos });
    }

    const accion = editingId ? "actualizado" : "creado";
    cerrarModal();
    await loadSuppliers();
    mostrarMensaje(message, `Proveedor "${datos.name}" ${accion} correctamente.`, "ok");
  } catch (error) {
    mostrarMensaje(formMessage, mensajeDeError(error), "error");
  } finally {
    saveButton.disabled = false;
  }
});

// =========================================
// DESACTIVAR (baja lógica)
// =========================================

async function desactivarProveedor(id, nombre) {
  const confirmado = window.confirm(
    `¿Desactivar el proveedor "${nombre}"?\nNo se borra: dejará de estar disponible para nuevos productos.`
  );
  if (!confirmado) return;

  try {
    await apiFetch(`/suppliers/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadSuppliers();
    mostrarMensaje(message, `Proveedor "${nombre}" desactivado.`, "ok");
  } catch (error) {
    mostrarMensaje(message, mensajeDeError(error), "error");
  }
}

// =========================================
// EVENTOS
// =========================================

// Un solo listener para todos los botones de la tabla (delegación de eventos)
suppliersTable.addEventListener("click", (evento) => {
  const editar = evento.target.closest("[data-edit-id]");
  const desactivar = evento.target.closest("[data-deactivate-id]");

  if (editar) {
    abrirModal(suppliers.find((s) => s._id === editar.dataset.editId));
  } else if (desactivar) {
    desactivarProveedor(desactivar.dataset.deactivateId, desactivar.dataset.deactivateName);
  }
});

// Buscar mientras se escribe, esperando 300 ms para no saturar la API
let temporizador;
supplierSearch.addEventListener("input", () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(loadSuppliers, 300);
});

activeFilter.addEventListener("change", loadSuppliers);
filtersForm.addEventListener("submit", (evento) => {
  evento.preventDefault();
  loadSuppliers();
});
refreshButton.addEventListener("click", loadSuppliers);

addSupplierButton?.addEventListener("click", () => abrirModal());
document.getElementById("close-supplier-modal").addEventListener("click", cerrarModal);
document.getElementById("cancel-supplier").addEventListener("click", cerrarModal);

// Cerrar con Escape o pulsando fuera de la ventana
supplierModal.addEventListener("click", (evento) => {
  if (evento.target === supplierModal) cerrarModal();
});
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !supplierModal.hidden) cerrarModal();
});

loadSuppliers();
