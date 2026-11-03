/* =========================================
   LOOPSTOCK - IMPORTACIONES CSV
   Requiere: config.js, api.js, auth.js
   ========================================= */

const importForm = document.getElementById("import-form");
const fileInput = document.getElementById("csv-file");
const importButton = document.getElementById("import-button");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refresh-button");

// Resultado / detalle
const resultSection = document.getElementById("import-result");
const resultTitle = document.getElementById("result-title");
const resultSubtitle = document.getElementById("result-subtitle");
const resultStatus = document.getElementById("result-status");
const resultTotal = document.getElementById("result-total");
const resultInserted = document.getElementById("result-inserted");
const resultErrors = document.getElementById("result-errors");
const errorsContainer = document.getElementById("errors-container");
const errorsTable = document.getElementById("errors-table");

// Historial
const historyTable = document.getElementById("history-table");
const historyCount = document.getElementById("history-count");

const pendingSection = document.getElementById("pending-suppliers-section");
const pendingMessage = document.getElementById("pending-suppliers-message");
const pendingList = document.getElementById("pending-suppliers-list");
const saveSuppliersButton = document.getElementById("save-suppliers-button");

let importacionActualId = null;

const TAMANO_MAXIMO = 2 * 1024 * 1024;

const ESTADOS = {
  completed: { texto: "Completada", clase: "badge-success" },
  partial: { texto: "Parcial", clase: "badge-warning" },
  failed: { texto: "Fallida", clase: "badge-danger" }
};

const fechaFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short"
});

function mostrarMensaje(texto, tipo = "") {
  message.textContent = texto;
  message.dataset.tipo = tipo;
}

function badgeEstado(status) {
  const estado = ESTADOS[status] || { texto: status, clase: "" };
  return `<span class="badge ${estado.clase}">${escaparHtml(estado.texto)}</span>`;
}

// =========================================
// MOSTRAR UN RESULTADO (tras importar o desde el historial)
// =========================================

function mostrarResultado(job, titulo) {
  const estado = ESTADOS[job.status] || { texto: job.status, clase: "" };

  resultTitle.textContent = titulo;
  resultSubtitle.textContent =
    `${job.fileName} · ${fechaFormatter.format(new Date(job.createdAt))}`;
  resultStatus.className = `badge ${estado.clase}`;
  resultStatus.textContent = estado.texto;

  resultTotal.textContent = job.totalRows;
  resultInserted.textContent = job.insertedRows;
  resultErrors.textContent = job.errorRows;

  const errores = job.rowErrors || [];
  errorsContainer.hidden = errores.length === 0;
  errorsTable.innerHTML = errores.map((e) => `
    <tr>
      <td>${escaparHtml(e.row)}</td>
      <td>${escaparHtml(e.sku || "—")}</td>
      <td>${escaparHtml(e.message)}</td>
    </tr>
  `).join("");

  resultSection.hidden = false;
  cargarPendientes(job._id);
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

pendingList.addEventListener("change", actualizarBotonProveedores);

saveSuppliersButton.addEventListener("click", async () => {
  const selects = [
    ...pendingList.querySelectorAll(".pending-supplier-select")
  ];

  const asignaciones = selects.map((select) => ({
    productId: select.dataset.productId,
    supplierId: select.value
  }));

  if (asignaciones.some((a) => !a.supplierId)) {
    mostrarMensaje("Selecciona un proveedor para cada producto.", "error");
    return;
  }

  saveSuppliersButton.disabled = true;
  saveSuppliersButton.textContent = "Guardando...";

  try {
    const resultado = await apiFetch(
      `/imports/${encodeURIComponent(importacionActualId)}/assign-suppliers`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asignaciones })
      }
    );

    mostrarMensaje(resultado.mensaje, "ok");

    await cargarPendientes(importacionActualId);
    await loadHistory();
  } catch (error) {
    mostrarMensaje(mensajeDeError(error), "error");
  } finally {
    saveSuppliersButton.textContent = "Guardar proveedores";
    actualizarBotonProveedores();
  }
});

async function cargarPendientes(jobId) {
  importacionActualId = jobId;
  pendingSection.hidden = true;
  pendingList.innerHTML = "";

  try {
    const datos = await apiFetch(
      `/imports/${encodeURIComponent(jobId)}/pending-suppliers`
    );

    const productos = datos.productos || [];
    const proveedores = datos.proveedores || [];

    if (productos.length === 0) {
      pendingSection.hidden = true;
      return;
    }

    pendingSection.hidden = false;
    pendingMessage.textContent =
      `${productos.length} producto(s) necesitan proveedor.`;

    pendingList.innerHTML = productos.map((item) => {
      const product = item.product || {};

      return `
        <div class="form-group">
          <label>
            ${escaparHtml(product.name || item.name)}
            (${escaparHtml(product.sku || item.sku)})
          </label>

          <select
            class="pending-supplier-select"
            data-product-id="${escaparHtml(item.product?._id || item.product)}"
          >
            <option value="">Selecciona un proveedor</option>

            ${proveedores.map((supplier) => `
              <option value="${escaparHtml(supplier._id)}">
                ${escaparHtml(supplier.name)}
              </option>
            `).join("")}
          </select>
        </div>
      `;
    }).join("");

    actualizarBotonProveedores();
  } catch (error) {
    mostrarMensaje(mensajeDeError(error), "error");
  }
}

function actualizarBotonProveedores() {
  const selects = [
    ...pendingList.querySelectorAll(".pending-supplier-select")
  ];

  saveSuppliersButton.disabled =
    selects.length === 0 ||
    selects.some((select) => !select.value);
}

// =========================================
// SUBIR EL CSV
// =========================================

importForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const archivo = fileInput.files[0];

  // Comprobaciones rápidas en el navegador (el backend vuelve a validarlo todo)
  if (!archivo) return mostrarMensaje("Selecciona un archivo CSV.", "error");
  if (!archivo.name.toLowerCase().endsWith(".csv")) {
    return mostrarMensaje("El archivo debe tener extensión .csv.", "error");
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return mostrarMensaje("El archivo supera el tamaño máximo de 2 MB.", "error");
  }

  const formData = new FormData();
  formData.append("file", archivo);

  importButton.disabled = true;
  importButton.textContent = "Importando...";
  mostrarMensaje("");

  try {
    const { mensaje, importacion } = await apiFetch("/imports", {
      method: "POST",
      body: formData
    });

    const tipo = importacion.status === "completed" ? "ok"
      : importacion.status === "partial" ? "aviso" : "error";

    mostrarMensaje(mensaje, tipo);
    mostrarResultado(importacion, "Resultado de la importación");
    importForm.reset();
    loadHistory();
  } catch (error) {
    mostrarMensaje(mensajeDeError(error), "error");
  } finally {
    importButton.disabled = false;
    importButton.textContent = "Importar";
  }
});

// =========================================
// HISTORIAL
// =========================================

async function loadHistory() {
  refreshButton.disabled = true;

  try {
    const jobs = await apiFetch("/imports");
    historyCount.textContent = `${jobs.length} importación(es)`;

    historyTable.innerHTML = jobs.length === 0
      ? '<tr><td colspan="7">Todavía no se ha importado ningún archivo.</td></tr>'
      : jobs.map((job) => `
        <tr>
          <td>${fechaFormatter.format(new Date(job.createdAt))}</td>
          <td>${escaparHtml(job.fileName)}</td>
          <td>${escaparHtml(job.user?.name || "—")}</td>
          <td>${badgeEstado(job.status)}</td>
          <td>${job.insertedRows} / ${job.totalRows}</td>
          <td>${job.errorRows}</td>
          <td>
            <button type="button" class="btn btn-secondary" data-job-id="${escaparHtml(job._id)}">
              Ver detalle
            </button>
          </td>
        </tr>
      `).join("");
  } catch (error) {
    historyTable.innerHTML = '<tr><td colspan="7">No se pudo cargar el historial.</td></tr>';
    historyCount.textContent = "Error al cargar el historial";
    mostrarMensaje(mensajeDeError(error), "error");
  } finally {
    refreshButton.disabled = false;
  }
}

// El detalle (con los errores por fila) se pide solo al pulsar el botón
historyTable.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("[data-job-id]");
  if (!boton) return;

  try {
    const job = await apiFetch(`/imports/${encodeURIComponent(boton.dataset.jobId)}`);
    mostrarResultado(job, "Detalle de la importación");
  } catch (error) {
    mostrarMensaje(mensajeDeError(error), "error");
  }
});

refreshButton.addEventListener("click", loadHistory);

loadHistory();
