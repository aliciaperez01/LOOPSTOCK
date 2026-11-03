const usersTable = document.getElementById("users-table");
const userCount = document.getElementById("user-count");
const message = document.getElementById("message");

const filtersForm = document.getElementById("user-filters");
const roleFilter = document.getElementById("role-filter");
const activeFilter = document.getElementById("active-filter");

const modal = document.getElementById("user-modal");
const userForm = document.getElementById("user-form");
const formMessage = document.getElementById("form-message");

const addUserButton = document.getElementById("add-user-button");
const refreshButton = document.getElementById("refresh-button");
const closeModalButton = document.getElementById("close-user-modal");
const cancelButton = document.getElementById("cancel-user");
const saveButton = document.getElementById("save-user");

const currentUser = getUsuario();

function mostrarMensaje(elemento, texto, tipo = "") {
  elemento.textContent = texto;
  elemento.dataset.tipo = tipo;
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) return "—";

  return fechaValida.toLocaleDateString("es-ES");
}

function etiquetaRol(rol) {
  return rol === "admin" ? "Administrador" : "Empleado";
}

function renderizarUsuarios(usuarios) {
  userCount.textContent =
    `${usuarios.length} ${usuarios.length === 1 ? "usuario" : "usuarios"}`;

  if (usuarios.length === 0) {
    usersTable.innerHTML = `
      <tr>
        <td colspan="6">No se encontraron usuarios.</td>
      </tr>
    `;
    return;
  }

  usersTable.innerHTML = usuarios.map((usuario) => {
    const esMiCuenta =
      String(usuario._id) === String(currentUser?._id);

    const estado = usuario.active
      ? '<span class="badge badge-success">Activo</span>'
      : '<span class="badge badge-danger">Inactivo</span>';

    const accion = usuario.active
      ? esMiCuenta
        ? '<span class="gestion-help">Tu cuenta</span>'
        : `
          <button
            type="button"
            class="btn btn-secondary"
            data-action="deactivate"
            data-id="${escaparHtml(usuario._id)}"
          >
            Desactivar
          </button>
        `
      : '<span class="gestion-help">Sin acciones</span>';

    return `
      <tr>
        <td>${escaparHtml(usuario.name)}</td>
        <td>${escaparHtml(usuario.email)}</td>
        <td>${escaparHtml(etiquetaRol(usuario.role))}</td>
        <td>${estado}</td>
        <td>${escaparHtml(formatearFecha(usuario.createdAt))}</td>
        <td>${accion}</td>
      </tr>
    `;
  }).join("");
}

async function cargarUsuarios() {
  mostrarMensaje(message, "Cargando usuarios...");

  usersTable.innerHTML = `
    <tr>
      <td colspan="6">Cargando usuarios...</td>
    </tr>
  `;

  const parametros = new URLSearchParams();

  if (roleFilter.value) {
    parametros.set("role", roleFilter.value);
  }

  if (activeFilter.value) {
    parametros.set("active", activeFilter.value);
  }

  try {
    const consulta = parametros.toString();
    const ruta = consulta ? `/users?${consulta}` : "/users";

    const usuarios = await apiFetch(ruta);

    renderizarUsuarios(usuarios);
    mostrarMensaje(message, "");
  } catch (error) {
    usersTable.innerHTML = `
      <tr>
        <td colspan="6">No se pudieron cargar los usuarios.</td>
      </tr>
    `;

    mostrarMensaje(message, mensajeDeError(error), "error");
    userCount.textContent = "Error al cargar usuarios";
  }
}

function abrirModal() {
  userForm.reset();
  mostrarMensaje(formMessage, "");
  modal.hidden = false;
  document.getElementById("name").focus();
}

function cerrarModal() {
  modal.hidden = true;
  userForm.reset();
  mostrarMensaje(formMessage, "");
}

async function crearUsuario(evento) {
  evento.preventDefault();

  if (!userForm.reportValidity()) return;

  const datos = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    role: document.getElementById("role").value
  };

  saveButton.disabled = true;
  saveButton.textContent = "Creando...";

  mostrarMensaje(formMessage, "");

  try {
    await apiFetch("/users", {
      method: "POST",
      body: datos
    });

    cerrarModal();
    await cargarUsuarios();
    mostrarMensaje(message, "Usuario creado correctamente.", "ok");

  } catch (error) {
    mostrarMensaje(formMessage, mensajeDeError(error), "error");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Crear usuario";
  }
}

async function desactivarUsuario(id) {
  const confirmar = window.confirm(
    "¿Seguro que quieres desactivar este usuario? No podrá volver a iniciar sesión."
  );

  if (!confirmar) return;

  try {
    await apiFetch(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    mostrarMensaje(message, "Usuario desactivado correctamente.", "ok");
    await cargarUsuarios();

  } catch (error) {
    mostrarMensaje(message, mensajeDeError(error), "error");
  }
}

// Eventos de filtros
filtersForm.addEventListener("submit", (evento) => {
  evento.preventDefault();
  cargarUsuarios();
});

roleFilter.addEventListener("change", cargarUsuarios);
activeFilter.addEventListener("change", cargarUsuarios);

// Eventos de botones
addUserButton.addEventListener("click", abrirModal);
refreshButton.addEventListener("click", cargarUsuarios);
closeModalButton.addEventListener("click", cerrarModal);
cancelButton.addEventListener("click", cerrarModal);

userForm.addEventListener("submit", crearUsuario);

// Cerrar modal al pulsar fuera de la ventana
modal.addEventListener("click", (evento) => {
  if (evento.target === modal) cerrarModal();
});

// Cerrar modal con Escape
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !modal.hidden) {
    cerrarModal();
  }
});

// Acciones de la tabla
usersTable.addEventListener("click", (evento) => {
  const boton = evento.target.closest('[data-action="deactivate"]');

  if (!boton) return;

  desactivarUsuario(boton.dataset.id);
});

// Carga inicial
cargarUsuarios();
