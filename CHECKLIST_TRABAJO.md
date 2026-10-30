# CHECKLIST_TRABAJO — LoopStock (Ali y Coral)

> **Fuente de verdad del equipo.** Si algo de aquí contradice al código o a GitHub, manda el código; corregid entonces este archivo.
> **Revisión 2 — 28/10/2026 (tarde).** Contrastada con GitHub (`main` `375daa5`, `rama_alicia` `f57a661`, `rama_coral` `9c94bf4`) y con la copia local de Coral (rama `rama_coral`, cambios sin commit del 26/10). Revisión 1: auditoría de esta mañana (`LoopStock_Auditoria_y_Hoja_de_Ruta.docx`).
> **Cómo usarla:** cambia el estado y deja junto a la tarea el commit o el PR que lo demuestra. Nada pasa a `completada` sin cumplir su «Hecho cuando» y sus pruebas.
> **IDs:** los de la auditoría (T01–T23). `V-` = verificación, `J` = conjunta, `D` = decisión pendiente. Las estimaciones son orientativas.

**Estados:** `pendiente` · `en curso` · `bloqueada` · `pendiente de revisión` · `pendiente de integración` · `pendiente de pruebas` · `completada`
**Prioridad:** P0 = requisito obligatorio o bloqueo · P1 = necesaria para entregar · P2 = recomendable · P3 = opcional
**Tipo:** 🟥 necesaria para terminar · 🟨 recomendable · ⬜ opcional

---

## 0. Resumen

### Estado real (29/10, 19:05)
- `main` = `689b4ba`: PR #1 (`rama_coral`, 28/10), PR #2 (`feature/users`, T06) y PR #4 (`feature/prod-config`, T14).
- **Desplegado en Render (T15):** API en `https://loopstock.onrender.com` (Swagger en `/api/docs`) y frontend en `https://loopstock-school.onrender.com/pages/login.html`. Login, dashboard, proveedores e importaciones cargan; CORS OK.
- **Ali:** rama `tarea-alicia` (base `369bf1d`) con T09 solo en el backend (`523351f`), PR #3 abierto y **sin fusionar**. No fusionar hasta corregir lo indicado en T09.

### Recuento
| | Ali | Coral | Conjuntas |
|---|---|---|---|
| Necesarias sin hacer (P0–P1) | 8 | 6 | 6 |
| — de ellas bloqueadas | 2 (T12, T08) | 1 (T07) | 0 |
| Pendientes de pruebas | 1 (V-A2) | 0 | — |
| Recomendables (P2) | 1 | 1 | — |
| Opcionales (P3) | 3 | 2 | — |
| Completadas desde la revisión 1 | 0 | 3 (T01, V-C2, T02) | 0 |

### Próxima acción
- **Coral:** T07 (`/api/analytics/summary` con `aggregate`, no depende de la paginación) → `analytics.yaml` → T17. Enviar J1.
- **Ali:** `git pull origin main` en `tarea-alicia` → T05 (páginas con `apiFetch` y token) + terminar T09 (frontend y `/low-stock`) en el mismo PR → T16.
- **Juntas:** J1 (profesorado) y cerrar D4 (formato paginado) y D5 (borrado).

### Información que falta (declarada)
- Copia local de Ali: no se ha podido ver; puede haber trabajo sin subir desde el 24/10.
- Fecha de entrega: desconocida. Sin ella el plan no tiene fechas, solo orden.
- Respuesta del profesorado sobre el dominio (bootcamp → inventario).
- PRs abiertos en GitHub: esta sesión no puede consultar la API; la auditoría de esta mañana no encontró ninguno.
- Pruebas contra Atlas: las últimas son del 25/10.

---

## 1. Completado (con evidencia)

| Funcionalidad | Autora | Evidencia |
|---|---|---|
| Estructura inicial y conexión a MongoDB (`config/db.js`) | Ali | `375daa5`, `cbf88b7` |
| `Product.js` y CRUD (controller, service, routes), SKU único, búsqueda y filtro por categoría | Ali | `4da7a1f`, `d61e926`, `541c917`…`f57a661` |
| Middlewares `logger`, `noEncontrada` y `manejarErrores` (base) | Ali | `loopstock01–04` |
| Maquetación de products, product-form, dashboard y crear-catalogo; `menu.js`, `theme.js`, CSS | Ali | `3b4c2c3`, `loopstock01–04` |
| `User.js`, bcrypt, login JWT, `/api/auth/me`, `AppError` | Coral | `8d530c1` |
| Middlewares de roles y seed del primer admin | Coral | `42ac266`, `1916df8` |
| Integración de `rama_alicia` y `manejarErrores` unificado | Coral | `561a063` |
| Rutas de productos protegidas y `/low-stock` corregido (Express 5) | Coral | `f03dfbf`, `cbb654a` |
| CRUD de proveedores con baja lógica | Coral | `cbb654a` (Atlas, 25/10) |
| Importación CSV con Multer e `ImportJob` | Coral | `31eef82` (Atlas, 25/10: `partial`, 3/8) |
| Frontend de login, proveedores e importación; `api.js`, `auth.js`, `config.js` | Coral | `960f740`, `9c94bf4` (19 pruebas Playwright) |

> «Completado» = está en `rama_coral`. **Ninguna de estas funcionalidades está aún en `main`**, por eso V-A2 y V-C1 repiten las pruebas tras J2.
> Autoría compartida: Ali creó `api.js`, `auth.js`, `config.js`, `imports.js` y `suppliers.js` como esqueleto y Coral escribió su contenido.

---

## 2. Decisiones que hay que cerrar antes de empezar cada paso

| ID | Decisión | Quién | Antes de | Recomendación |
|---|---|---|---|---|
| D1 | ¿Se acepta el dominio de inventario y los roles admin/empleado? ¿Qué cuenta como «analítica»? | Juntas → profesorado (J1) | T07 | Enviar hoy. Si no aceptan, parar y replanificar |
| D2 | `crear-catalogo.html`: ¿se borra (duplica `imports.html`) o se adapta? | Ali + Coral | T05 | Borrarlo: menos superficie con 401 y menos que mantener |
| D3 | Relación producto → proveedor: desplegable (mínimo) u `ObjectId` con `ref` (completo) | Ali + Coral | T10 | Mínimo: no obliga a tocar `imports.service.js` de Coral |
| D4 | Formato de `GET /api/products` con paginación: `{ items, total, page, pages }` | Ali (propone) + Coral (acepta) | T09 y T07 | Fijarlo por escrito; `dashboard.js` y la analítica dependen de él |
| D5 | Borrado de productos: baja lógica (`status: "inactive"`) o borrado real | Ali + Coral | T11 y T07 | Baja lógica, coherente con proveedores (D6); la analítica excluye `inactive` |
| D6 | Fecha de entrega y fechas objetivo por paso | Juntas | Paso 2 | Rellenar la columna de fechas del apartado 6 |

Decisiones técnicas ya cerradas (D1–D13 de `continuidad-loopstock.md`) siguen vigentes. Se mantiene el formato de respuesta actual (JSON directo, sin `{ success, data, message }`): el enunciado no lo exige y cambiarlo obligaría a reescribir el backend y `apiFetch`.

---

## 3. Checklist de Ali

> **Archivos de Ali:** `models/Product.js`, `controllers|services|routes/products.*`, `src/docs/products.yaml`, `pages/products|product-form|dashboard.html`, `js/products|product-form|dashboard.js`, `crear-catalogo.html`, `index.html`.

### 🟥 Necesarias
- [x] **V-A1 — Confirmar que no hay cambios locales sin subir**
  - P0 · `completada` (29/10: Ali subió `tarea-alicia` desde `369bf1d`) · Depende de: — · 0,2 h
  - Hecho cuando: `git status` limpio y `git log origin/rama_alicia..HEAD` vacío, o los cambios están subidos y avisados. Se da por cerrada cuando Ali sube su primera rama desde `main` (cualquier trabajo local pendiente aparecerá ahí).
  - Riesgo: si hay trabajo sin subir y se fusiona J2 antes, habrá conflictos en `products.*`.
- [ ] **T05 — Conectar las páginas de productos con el login**
  - P0 · `pendiente` · Depende de: J2, D2 · 2–3 h
  - Archivos: `pages/products|product-form|dashboard.html`, `js/products|product-form|dashboard.js`, `crear-catalogo.html` (según D2)
  - Pasos: `<script>` de `config.js`, `api.js`, `auth.js` antes del JS de la página + `protegerPagina()` · `fetch(API_URL…)` → `apiFetch("/products…")` y borrar las constantes con `localhost` · «Cerrar sesión» con `data-logout` · `data-role="admin"` en Eliminar.
  - Hecho cuando: admin y empleado navegan sin 401 en consola, el empleado no ve Eliminar, el logout borra el token, y `grep -rn localhost frontend` solo encuentra `js/config.js`.
  - Pruebas: navegación manual con los dos roles (requiere T06 o un empleado de demo) y consola del navegador abierta.
  - Riesgo: no tocar `api.js` ni `auth.js` (son de Coral); si falta algo, pedírselo.
- [ ] **V-A2 — CRUD de productos sobre `main` integrada**
  - P1 · `pendiente de pruebas` · Depende de: J2 · 0,5 h
  - Pruebas: SKU duplicado → 409 · ID no válido → 400 · inexistente → 404 · `quantity` 0 al crear → 400 · sin token → 401 · `DELETE` con empleado → 403.
- [ ] **T16 — `frontend/index.html`** (0 bytes): redirige a `pages/dashboard.html` si hay token y, si no, a `pages/login.html`
  - P1 · `pendiente` · Depende de: T05 · 0,5 h
  - Hecho cuando: abrir la raíz del frontend (local y Render) nunca muestra una página en blanco.
- [ ] **T09 — Paginación de productos**
  - P1 · `en curso` (backend en `tarea-alicia` `523351f`, PR #3 sin fusionar) · Depende de: T05 (mismos archivos), D4 · 2–3 h
  - Archivos: `services/products.service.js`, `controllers/products.controller.js`, `js/products.js`, `pages/products.html`
  - Detalle: `GET /api/products?page=&limit=` → formato de D4; mantiene `search` y `category`; `limit` 10 por defecto y 100 como máximo; `page`/`limit` no numéricos → 400.
  - Hecho cuando: `?page=2&limit=5` devuelve 5 productos y el `total` correcto, y la interfaz cambia de página.
  - Riesgo: rompe `dashboard.js` (espera un array) y la importación no le afecta. Arreglar `dashboard.js` en el mismo PR.
  - **Revisión de `523351f` (29/10), pendiente antes de fusionar:** (1) `products.js` y `dashboard.js` siguen esperando un array → adaptarlos a `{ items, total, page, pages }`; (2) `listarBajoStock` reutiliza `listar` y ahora devuelve solo 10 productos → que `/low-stock` no pagine; (3) `page`/`limit` no numéricos usan el valor por defecto en vez de 400 → decidir en D4 y documentarlo; (4) hacer `git pull origin main` (la rama no tiene T06 ni T14); (5) `products.yaml` (T12) ya no está bloqueado.
- [ ] **T10 — Relación producto → proveedor**
  - P1 · `pendiente` · Depende de: J2, D3 · 2–3 h
  - Archivos: `pages/product-form.html`, `js/product-form.js` y, si D3 = completo, `models/Product.js` (+ `imports.service.js`, de Coral).
  - Hecho cuando: no se puede guardar un producto con un proveedor inexistente o inactivo y `data/productos-prueba.csv` sigue importando igual (`partial`, 3/8).
  - Riesgo: con D3 = completo, Ali y Coral tocarían a la vez la lógica de proveedor → Coral hace el cambio de `imports.service.js` en su rama.
- [ ] **T12 — `src/docs/products.yaml`** (plantilla: `suppliers.yaml`)
  - P0 · `bloqueada` (Swagger aún no está en GitHub) · Depende de: T02, T09 · 1,5 h
  - Hecho cuando: todas las rutas de `/api/products` (incluidas `/low-stock` y la paginación) aparecen en `/api/docs` y funcionan con Authorize. Si se hace T11 después, se actualiza el `DELETE`.
- [ ] **T08 — El dashboard usa `/api/analytics/summary`**
  - P1 · `bloqueada` · Depende de: T05, T07 · 1–2 h
  - Archivos: `js/dashboard.js`, `pages/dashboard.html`
  - Hecho cuando: las cifras coinciden con la respuesta del endpoint con los mismos datos.
- [ ] **T19b — Sección de productos en el README** (endpoints, filtros, paginación)
  - P1 · `pendiente` · Depende de: T09, T19 · 0,5 h

### 🟨 Recomendables
- [ ] **T11 — Borrado de productos según D5**
  - P2 · `pendiente` · Depende de: T10, D5 · 1–2 h
  - Archivos: `services/products.service.js`, `controllers/products.controller.js`, `models/Product.js`
  - Hecho cuando: `DELETE` deja el producto `inactive`, el listado y `/low-stock` lo ocultan y Swagger lo documenta.
  - Riesgo: cambia un campo de `Product` → avisar a Coral (la analítica debe filtrar `inactive`).

### ⬜ Opcionales
- [ ] **T21 — Limpiar el repo:** quitar de Git `~$parto de tareas.docx`, `package.json` y `package-lock.json` de la raíz (dependencias instaladas ahí por error), `backend/legacy-mongodb/`, `frontend/js/router.js` (vacío); añadir `*.docx` y `~$*` a `.gitignore`. El `package.json` de la raíz ya causó un fallo en Render («Missing script: start»). · P3 · 0,5 h · Depende de: J2 · Prueba: el backend arranca desde `backend/`.
- [ ] **T22b — Jest + Supertest de productos** (409, 400). · P3 · 3–4 h · Depende de: J2
- [ ] **T23 — Movimientos de stock** (`movements.html` y `movements.js` están vacíos). · P3 · 5–6 h · Depende de: T11

---

## 4. Checklist de Coral

> **Archivos de Coral:** `models/User|Supplier|ImportJob.js`, `auth.*`, `suppliers.*`, `imports.*`, `users.*`, `analytics.*`, `middlewares/auth|upload.middleware.js`, `config/swagger.js`, `src/docs/*.yaml` (menos `products.yaml`), `js/config|api|auth.js`, páginas de login, proveedores e importación. **`server.js` solo lo modifica Coral.**

### 🟥 Necesarias
- [x] **T01 — Restaurar `const AppError = require("../utils/AppError");`** en `backend/src/services/auth.service.js` (línea 3, copia local)
  - P0 · `completada` (28/10) · Depende de: — · 5 min
  - Evidencia: PowerShell contra Atlas → login vacío 400, credenciales incorrectas 401. Sin commit: el archivo vuelve a ser idéntico a `9c94bf4` (el fallo solo estaba en local).
- [x] **V-C2 — Swagger en local**
  - P0 · `completada` (28/10) · Depende de: T01 · 0,3 h
  - Evidencia: `/api/docs` carga; `GET /api/suppliers` sin token → 401 «Token no proporcionado», token falso → 401 «Token inválido o expirado», token válido → acceso. Nota: copiar el token desde la UI puede meter caracteres no ISO-8859-1; usar `$r.token | Set-Clipboard` en PowerShell.
  - Pruebas: `/api/docs` y `/api/docs.json` cargan; Authorize con token; probar desde la UI un login y un `GET /api/suppliers`.
- [x] **T02 — Commit y push de Swagger a `rama_coral`**
  - P0 · `completada` (28/10, commit `8b161d7`) · Depende de: T01, V-C2 · 0,5 h
  - Archivos: `backend/src/config/swagger.js`, `backend/src/docs/auth|suppliers|imports.yaml`, `backend/src/server.js`, `backend/package.json`, `backend/package-lock.json`, `CHECKLIST_TRABAJO.md` (los `.docx` de planificación no se suben)
  - Hecho cuando: el commit está en `origin/rama_coral` y `git status` no muestra esos archivos.
  - Riesgo: toca `server.js` y `package.json` (compartidos) → avisar a Ali. Ali tendrá que hacer `npm install` en `backend/` tras J2.
- [x] **V-C1 — Repetir sobre `main` las pruebas del 25/10**
  - P1 · `completada` (PR #2 fusionado, `89a4df8`, 29/10) · Depende de: J2 · 2–3 h
  - Evidencia: login 400/401/200 · proveedores 400 (validación e ID), 404, 409 · CSV → `ImportJob` con errores por fila · `.txt` → 400 · `GET /api/imports/:id` 200 con `rowErrors`.
  - Pruebas: login 200/400/401 · proveedores 400/404/409 · CSV de prueba → `partial` · `.txt` → 400 · `GET /api/imports/:id` muestra errores por fila.
- [x] **T06 — Crear usuarios empleado**
- **Coral:** T07 (`/api/analytics/summary` con `aggregate`, no depende de la paginación) → `analytics.yaml` → T17. Enviar J1.
- **Ali:** `git pull origin main` en `tarea-alicia` → T05 (páginas con `apiFetch` y token) + terminar T09 (frontend y `/low-stock`) en el mismo PR → T16.
- **Juntas:** J1 (profesorado) y cerrar D4 (formato paginado) y D5 (borrado).
  - Hecho: `GET/POST /api/users` y `DELETE /api/users/:id` (baja lógica), solo admin; el admin puede crear admins; lista blanca de campos; un admin no puede desactivarse a sí misma. Sin `users.html` (decidido).
  - Evidencia (Atlas): sin token 401 · empleado 403 · POST 201 (un `active` colado se ignora) · email duplicado en mayúsculas 409 · rol no válido 400 · body vacío 400 · login del empleado 200 · `?role=jefe` 400 · DELETE: ID no válido 400, inexistente 404, a sí misma 400, OK 200 · login de un usuario desactivado → 403.
  - Empleado de demo en Atlas: `empleado@loopstock.com` (la contraseña se comparte con Ali por privado, no en el repo).
  - Opción recomendada: `POST/GET /api/users` solo admin (`routes|controllers|services/users.*`), registrada en `server.js`. Mínimo si falta tiempo: el seed también crea un empleado de demo.
  - Hecho cuando: el admin crea un empleado y ese empleado hace login.
  - Prioridad práctica: hacerla **la primera del Paso 2**; Ali la necesita para probar T05 con el rol empleado.
- [x] **V-C3 — Roles con un empleado real**
  - P1 · `completada` (28/10) · Depende de: T06 · 0,3 h · Evidencia: los 4 casos dan el código esperado.
  - Pruebas: empleado → `DELETE /api/products/:id` 403 · `POST /api/suppliers` 403 · `POST /api/imports` 403 · `GET /api/products` 200.
- [x] **T14 — Configuración de producción**
  - P1 · `completada` (PR #4, `689b4ba`, 29/10) · Depende de: J2 · 1 h
  - Evidencia: origen permitido → cabecera CORS; no permitido → sin cabecera (antes 500); sin `JWT_SECRET` no arranca; en producción tampoco sin `FRONTEND_URL`; barra final en `FRONTEND_URL` tolerada; `config.js` elige la URL en 4 casos. Login local con Live Server (5500) OK.
  - Archivos: `backend/src/server.js`, `backend/.env.example`, `frontend/js/config.js`
  - Detalle: `cors({ origin: FRONTEND_URL })` con lista separada por comas (ahora `cors()` está abierto) · el servidor no arranca sin `JWT_SECRET` ni `MONGODB_URI` · `config.js` elige la URL de la API según `location.hostname`.
  - Hecho cuando: un origen no permitido se bloquea, el servidor no arranca sin `JWT_SECRET` y el frontend local sigue funcionando.
  - Riesgo: si `FRONTEND_URL` no coincide con el puerto real de Live Server (5000 o 5500), todo el frontend falla. Documentarlo en el README.
- [ ] **T07 — Endpoints de analítica** (obligatorio)
  - P0 · `bloqueada` (D1/J1) · Depende de: J1, J2, D4, D5 · 4–5 h
  - Archivos nuevos: `routes|controllers|services/analytics.*`; registro en `server.js`.
  - Propuesta (con `aggregate`, token obligatorio, los dos roles): `GET /api/analytics/summary` (unidades, valor a coste y PVP, nº con stock bajo) · `/by-category` · `/by-supplier` · `/imports` (por estado y filas con error).
  - Hecho cuando: las respuestas cuadran con un conjunto de datos calculado a mano y sin token → 401.
  - Riesgo: si D5 = baja lógica, filtrar `inactive`. Si J1 tarda, Coral puede empezar con `/summary` (sirve con cualquier dominio de inventario) y dejar el resto.
- [ ] **T13 — `analytics.yaml` y `users.yaml`**
  - P0 · `en curso` (`users.yaml` en `main` desde el PR #2; falta `analytics.yaml`) · Depende de: T06, T07 · 1 h
  - Hecho cuando: los dos módulos se prueban desde `/api/docs`.
- [x] **T15 — Despliegue en Render**
  - P0 · `completada` (29/10) · Depende de: T14 (y J2) · 2–3 h · **Cambio respecto a la revisión 1:** antes dependía de J3.
  - Detalle: Web Service (raíz `backend`, `npm install` / `npm start`, variables `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `NODE_ENV`) · Static Site (raíz `frontend`) · auto-deploy desde `main` · Network Access de Atlas · `seed:admin` contra producción (necesita `ADMIN_EMAIL` y `ADMIN_PASSWORD`, en local o como variables temporales).
  - Hecho cuando: en la URL pública funcionan `/api/docs` y el login del Static Site lleva al dashboard. Cada fusión posterior en `main` se redespliega sola.
  - **Configuración real:**
    - Web Service `loopstock` → `https://loopstock.onrender.com` · Root Directory `backend` · Build `npm install` · Start `npm start` · variables `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` (sin `PORT` ni `ADMIN_*`: el admin ya existe en Atlas, misma BD).
    - Static Site `loopstock-school` → `https://loopstock-school.onrender.com/pages/login.html` · Root Directory vacío · Build `echo ok` · Publish Directory `frontend` (con Root Directory `frontend` daba «Not Found»).
    - `FRONTEND_URL` (backend) = `https://loopstock-school.onrender.com,http://localhost:5500,http://127.0.0.1:5500`.
    - Atlas Network Access: `0.0.0.0/0` (Render gratuito no tiene IP fija).
  - Notas: el plan gratuito duerme el backend tras 15 min (primera petición ~50 s; abrirlo antes de la presentación). La raíz del Static Site sale en blanco hasta T16. Movimientos en blanco (T23, opcional).
- [ ] **T19 — README real**
  - P1 · `pendiente` · Depende de: T15 · 1,5 h
  - Contenido: instalación, `.env` sin secretos, scripts, endpoints, roles, URL de Render, Swagger, decisiones, cómo crear el admin. Corregir los puertos (pone 3000/5500; reales: 3001 y 5000 o 5500).
  - Hecho cuando: alguien nuevo arranca el proyecto en local solo con el README.

### 🟨 Recomendables
- [ ] **T17 — Nombre de proveedor único sin distinguir mayúsculas**
  - P2 · `pendiente` · Depende de: J2 · 0,5 h
  - Archivo: `models/Supplier.js` → índice con `collation: { locale: "es", strength: 2 }`. Puede hacer falta borrar en Atlas el índice `name_1`.
  - Hecho cuando: crear «pioneer» con «Pioneer» existente → 409.

### ⬜ Opcionales
- [ ] **T22a — Jest + Supertest de auth e importación** (401, 403, 400). · P3 · 3–4 h · Depende de: J2
- [ ] Token en cookie `httpOnly` en lugar de `localStorage` (D11). · P3 · sin estimar

---

## 5. Checklist conjunta (puntos de control)

- [ ] **J1 — Confirmar el dominio y la analítica con el profesorado** (D1)
  - P0 · `pendiente` · Depende de: — · 0,5 h
  - Hecho cuando: respuesta por escrito guardada en el canal del equipo. Desbloquea T07.
- [x] **J2 — PR `rama_coral → main`** (lo abre Coral, lo revisa Ali)
  - P0 · `completada` (PR #1 fusionado el 28/10; ramas desde `main`: Coral `feature/users`, Ali `tarea-alicia`, base `369bf1d`) · Depende de: T01, T02, V-A1 · 1 h
  - Antes de fusionar: `git diff origin/main...origin/rama_coral --stat` revisado juntas (merge directo; `rama_coral` ya contiene `rama_alicia`).
  - Smoke test: el servidor arranca · login OK · `/api/products` sin token → 401 · CSV de prueba importa · `/api/docs` abre.
  - Hecho cuando: PR fusionado (✅ `369bf1d`, 28/10) y cada una ha subido a GitHub una rama creada desde `main` (✅ Coral: `feature/users`; ⏳ Ali). **Se comprueba en GitHub sin preguntar:** el commit base de la rama nueva de Ali debe ser `369bf1d` o posterior. El `npm install` no se verifica aparte: sin él el servidor no arranca (falta Swagger).
- [ ] **J3 — Integrar el Paso 2** (PR de Ali: T05, T16, T09 · PR de Coral: T06, T14, T17). Cada una revisa el de la otra.
  - P0 · Depende de: esas tareas · Hecho cuando: con admin y empleado, ninguna página da 401 inesperado y el 403 aparece solo donde toca.
- [ ] **J4 — Integrar el Paso 3** (T07, T08, T10, T11, T12, T13)
  - P0 · Hecho cuando: `/api/docs` documenta auth, usuarios, productos, proveedores, importaciones y analítica, y el dashboard muestra las cifras de la API.
- [ ] **J5 — Pruebas cruzadas de aceptación en Render** (Ali prueba lo de Coral y viceversa)
  - P1 · Depende de: T15, J4 · 2 h cada una · Los fallos se apuntan aquí como tareas nuevas.
- [ ] **J6 — Presentación técnica de 10 minutos** (arquitectura, decisiones, justificación del dominio, demo en Render)
  - P1 · Depende de: J5 · 3 h cada una · Hecho cuando: ensayo cronometrado ≤ 10 min y cada una defiende su parte.

### Verificación de requisitos del enunciado (para J5)
- [ ] Login: 200 con token · 400 sin datos · 401 con credenciales incorrectas
- [ ] Sin token → 401 · rol sin permiso → 403
- [ ] CSV válido → ImportJob con errores por fila · archivo no CSV → 400
- [ ] CRUD de productos y proveedores con 400, 404 y 409 donde corresponde
- [ ] Productos: búsqueda, categoría, paginación y `/low-stock`
- [ ] Analítica: métricas estructuradas
- [ ] `/api/docs` funciona en Render y documenta todos los módulos
- [ ] Frontend en Render: todas las páginas sin errores en consola

---

## 6. Orden de trabajo

Regla: no se empieza un paso hasta cerrar la integración del anterior.

| Paso | Objetivo | Ali (en paralelo) | Coral (en paralelo) | Integración | Hecho cuando | Duración | Fecha |
|---|---|---|---|---|---|---|---|
| 1. Estabilizar | Todo el código correcto en `main` | V-A1 · revisar el PR · preparar D2–D5 | T01 → V-C2 → T02 → abrir PR | **J1 + J2** | Smoke test de J2 OK y ramas nuevas creadas | ½ día | |
| 2. Integración | La app funciona con login y roles | T05 → T16 → T09 (+ V-A2) | **T06 primero** → T14 → T15 (primer despliegue) → T17 (+ V-C1, V-C3) | **J3** | J3 OK y la app ya responde en Render | 1–2 días | |
| 3. Requisitos | Analítica y Swagger completo | T10 → T11 → T12 → T08 | T07 → T13 | **J4** | `/api/docs` con 6 módulos y dashboard con la API | 2 días | |
| 4. Aceptación | Todo verificado en Render | Pruebas de lo de Coral | Pruebas de lo de Ali | **J5** | Checklist de requisitos completa | ½–1 día | |
| 5. Cierre | Entregar y defender | T19b | T19 | **J6** | Ensayo ≤ 10 min | 1 día | |

**Mejoras que se dejan para después de cumplir requisitos:** T11 si va justa de tiempo (entonces T07 no filtra `inactive`), T17, T21, T22a/b, T23 y cookie `httpOnly`.

### Entregables de cada una para integrar
- **PR de Ali:** descripción con las tareas cerradas, capturas de consola sin 401, lista de endpoints cambiados y el formato acordado en D4 si lo toca.
- **PR de Coral:** igual, más las variables de entorno nuevas en `.env.example` y los `.yaml` de Swagger de sus endpoints.

### Comprobaciones antes de fusionar cualquier PR
1. `git pull origin main` en la rama y conflictos resueltos por su autora.
2. `cd backend && npm install && npm run dev` arranca sin errores.
3. Smoke test de J2 (login, 401 sin token, CSV, `/api/docs`).
4. Las páginas tocadas, abiertas con admin y con empleado, sin errores en consola.
5. Si cambia un endpoint, su `.yaml` cambia en el mismo PR.
6. La otra persona aprueba el PR en GitHub.

### Revisión conjunta obligatoria
J2 (primer merge) · D3/T10 (relación con proveedores) · D4/T09 + T07 (formato de productos y analítica) · T15 (variables y URLs de Render) · J6.

### Archivos compartidos (avisar antes de tocarlos)
- `backend/src/server.js`: solo Coral. Si Ali necesita registrar algo, se lo pide.
- `backend/package.json` y `package-lock.json`: avisar antes de `npm install`; siempre desde `backend/`.
- `middlewares/manejarErrores.js`: no tocarlo sin acuerdo.
- `models/Product.js`: solo Ali; avisar de cualquier cambio de campos (T10, T11).
- `src/docs/`: cada una solo sus `.yaml`.
- `frontend/js/api.js` y `auth.js`: solo Coral.

**Ramas:** tras J2, una rama corta por paso desde `main` (p. ej. `feature/products-auth`, `feature/users-security`), PR revisado por la otra y fusión solo si pasa las comprobaciones. `rama_alicia` y `rama_coral` se retiran cuando `main` las contenga.

---

## 7. Registro de cambios

- **28/10 (mañana) — Revisión 1:** auditoría del repo; backlog T01–T23 y J1–J6.
- **28/10 (tarde) — Revisión 2:**
  - Comprobado: sin commits nuevos en ninguna rama; la regresión de T01 sigue en local. Ninguna tarea cambia a `completada`.
  - Estados unificados con el vocabulario acordado (`por verificar` → `pendiente de pruebas`, `en desarrollo` → `en curso`).
  - Añadidas las decisiones previas D1–D6, pruebas y riesgos por tarea, entregables por persona y comprobaciones antes de fusionar.
  - Tareas clasificadas en necesarias, recomendables y opcionales.
  - **T15** depende ahora de T14 + J2 (no de J3): desplegar pronto descubre antes los problemas de Render (mayúsculas en rutas, CORS, Atlas) y el auto-deploy actualiza el resto.
  - **T06** pasa a ser la primera tarea de Coral en el Paso 2: Ali necesita un empleado para validar T05.
  - **T22a/b** dependen de J2, no de T15: los tests no necesitan Render.
  - **T02** incluye subir este archivo, para que Ali lo vea.
  - Corregida la numeración: el `.docx` llamaba «fase 2/3» a J3/J4; aquí son los Pasos 2 y 3.
  - Verificado: todos los `require` relativos del backend resuelven en Linux (Render) y `swagger.js` construye la ruta de `docs` de forma compatible.
- **28/10 (18:15):** T01 y V-C2 completadas (pruebas en local contra Atlas). T02 en curso. Los `.docx` quedan fuera del repo: esta checklist es la fuente de verdad.
- **28/10 (19:10):** T02 completada (`8b161d7`). PR #1 `rama_coral → main` abierto (J2 pendiente de revisión). **Regla nueva:** integrar en `main` al cerrar cada bloque con su PR, como mucho cada 1–2 días, y antes de empezar trabajo que dependa de la otra; cada sesión empieza con `git pull origin main`.
- **28/10 (22:58):** PR #1 fusionado en `main` (`369bf1d`). Smoke test de J2 en la copia de Coral: servidor arranca · login 200 y 401 con credenciales incorrectas · `/api/products` sin token → 401 · CSV → `ImportJob` `failed` 0/8 (esperado: las 3 filas válidas ya existían desde el 25/10; los otros 5 errores coinciden) · `/api/docs` carga. Nota: con `curl`, el CSV hay que enviarlo con `;type=text/csv` (si no, llega como `application/octet-stream` y el filtro de Multer devuelve 400). Decisiones de T06 cerradas.
- **28/10 (23:00):** V-C1 completada. Rama `feature/users` creada desde `main`; T06 en curso.
- **28/10 (23:10):** T06 y V-C3 completadas en `feature/users`; `users.yaml` hecho (T13 en curso). Ali ya puede probar T05 con el empleado de demo en Atlas.
- **29/10 (14:00):** criterio de J2 y V-A1 cambiado para que se pueda comprobar en GitHub sin preguntar a Ali. Estado en GitHub: `rama_alicia` sin cambios desde el 25/10; Ali aún no ha subido una rama desde `main`.
- **29/10 (19:05):** PR #2 (T06) y PR #4 (T14) fusionados en `main` (`689b4ba`). T15 completada: backend y frontend en Render, login y páginas de Coral OK. V-A1 y J2 cerradas (Ali subió `tarea-alicia`). Revisión de la paginación de Ali (`523351f`, PR #3 sin fusionar): 5 puntos pendientes en T09.
