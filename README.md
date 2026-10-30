# LoopStock

**Gestión de inventario para una tienda de equipos DJ y producción musical.**

API REST (Node.js + Express + MongoDB) con autenticación JWT por roles, importación de productos por CSV, analítica de inventario y documentación Swagger, más un frontend en HTML, CSS y JavaScript sin frameworks.

## Demo en producción (Render)

| Servicio | URL |
|---|---|
| Frontend | https://loopstock-school.onrender.com/pages/login.html |
| API | https://loopstock.onrender.com/api |
| Swagger | https://loopstock.onrender.com/api/docs |

> El plan gratuito de Render duerme el backend: la primera petición puede tardar ~50 s.
> Entrar siempre por `/pages/login.html`.

## Tecnologías

- **Backend:** Node.js, Express 5, MongoDB Atlas, Mongoose 9, JWT (`jsonwebtoken`), `bcryptjs`, Multer, `csv-parse`, Swagger (`swagger-jsdoc`, `swagger-ui-express`).
- **Frontend:** HTML5, CSS3, JavaScript (fetch + token Bearer).
- **Despliegue:** Render (Web Service + Static Site) y MongoDB Atlas.

## Estructura

```text
LOOPSTOCK/
├── backend/
│   ├── data/productos-prueba.csv   # CSV de ejemplo para la importación
│   ├── src/
│   │   ├── config/        # db.js, swagger.js
│   │   ├── controllers/
│   │   ├── docs/          # un .yaml de Swagger por módulo
│   │   ├── middlewares/   # auth, roles, Multer, errores
│   │   ├── models/        # User, Product, Supplier, ImportJob
│   │   ├── routes/
│   │   ├── scripts/       # seed-admin.js
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── pages/             # login, dashboard, products, product-form, suppliers, imports
│   ├── js/                # config.js (URL de la API), api.js, auth.js, …
│   └── css/
├── CHECKLIST_TRABAJO.md
└── README.md
```

## Instalación en local

### Requisitos
- Node.js 20 o superior y npm.
- Una base de datos MongoDB (Atlas o local).
- Live Server (extensión de VS Code) para el frontend.

### 1. Clonar e instalar

```bash
git clone https://github.com/aliciaperez01/LOOPSTOCK.git
cd LOOPSTOCK/backend
npm install
```

> Todos los comandos `npm` se ejecutan dentro de `backend/`.

### 2. Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y completar:

| Variable | Ejemplo / descripción |
|---|---|
| `PORT` | `3001` |
| `NODE_ENV` | `development` (en Render: `production`) |
| `MONGODB_URI` | Cadena de conexión de Atlas (`mongodb+srv://usuario:contraseña@host/...`) |
| `JWT_SECRET` | Cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | `1h` |
| `FRONTEND_URL` | Orígenes permitidos por CORS, separados por comas y sin barra final: `http://localhost:5500,http://127.0.0.1:5500` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Datos del primer administrador (contraseña ≥ 8 caracteres) |

El servidor no arranca sin `MONGODB_URI` ni `JWT_SECRET`, ni en producción sin `FRONTEND_URL`. **No subir nunca el `.env`.**

### 3. Crear el primer administrador

```bash
npm run seed:admin
```

Es idempotente: si ya existe un usuario con ese email, no crea nada.

### 4. Arrancar

```bash
npm run dev     # desarrollo, con recarga (node --watch)
npm start       # producción
```

API en `http://localhost:3001/api` · Swagger en `http://localhost:3001/api/docs`.

### 5. Frontend

Abrir `frontend/pages/login.html` con Live Server (`http://localhost:5500` o `http://127.0.0.1:5500`).
`frontend/js/config.js` usa `http://localhost:3001/api` en local y la API de Render en cualquier otro dominio.

## Roles

| Rol | Permisos |
|---|---|
| `admin` | Todo: productos (incluido eliminar), proveedores, importaciones CSV y usuarios |
| `empleado` | Consultar, crear y editar productos; consultar proveedores; analítica |

Los permisos se comprueban en el backend (`verificarToken` + `autorizarRoles`). Ocultar botones en el frontend es solo comodidad.

## API

Todas las rutas, salvo `POST /api/auth/login`, requieren la cabecera `Authorization: Bearer <token>`.
Detalle de peticiones y respuestas en Swagger (`/api/docs`).

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | Login, devuelve el token JWT |
| GET | `/api/auth/me` | autenticado | Usuario de la sesión |
| GET | `/api/products` | admin, empleado | Listado (`?category=` y `?search=`) |
| GET | `/api/products/low-stock` | admin, empleado | Productos con `quantity <= minStock` |
| GET | `/api/products/:id` | admin, empleado | Detalle |
| POST | `/api/products` | admin, empleado | Crear (SKU único) |
| PUT | `/api/products/:id` | admin, empleado | Editar |
| DELETE | `/api/products/:id` | admin | Eliminar |
| GET | `/api/suppliers` | admin, empleado | Listado con búsqueda |
| GET | `/api/suppliers/:id` | admin, empleado | Detalle |
| POST | `/api/suppliers` | admin | Crear |
| PUT | `/api/suppliers/:id` | admin | Editar |
| DELETE | `/api/suppliers/:id` | admin | Baja lógica |
| POST | `/api/imports` | admin | Subir CSV (campo `file`) |
| GET | `/api/imports` | admin | Historial de importaciones |
| GET | `/api/imports/:id` | admin | Resumen y errores de una importación |
| GET | `/api/users` | admin | Listado de usuarios |
| POST | `/api/users` | admin | Crear usuario |
| DELETE | `/api/users/:id` | admin | Baja lógica (no puede desactivarse a sí mismo) |
| GET | `/api/analytics/summary` | admin, empleado | Totales: productos, unidades, valor de stock, stock bajo, agotados, categorías |
| GET | `/api/analytics/by-category` | admin, empleado | Inventario agrupado por categoría |
| GET | `/api/analytics/by-supplier` | admin, empleado | Inventario agrupado por proveedor |
| GET | `/api/analytics/imports` | admin, empleado | Importaciones por estado y tasa de éxito |

> Movimientos de stock (`/api/movements`) están en integración (rama `integracion/tarea-alicia`).

### Ejemplo con curl (Git Bash)

```bash
read -s P   # escribir la contraseña (no se muestra) y Enter
T=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@loopstock.com\",\"password\":\"$P\"}" \
  | sed -E 's/.*"token":"([^"]+)".*/\1/')
curl -s http://localhost:3001/api/analytics/summary -H "Authorization: Bearer $T"
```

## Importación CSV

- Subida con Multer en memoria: máximo **2 MB**, solo `.csv` (extensión y MIME). Otro formato → `400`.
- Separador `;` o `,`, detectado por la cabecera.
- Columnas: `sku;name;brand;category;quantity;price;cost;minStock;supplier` (ver `backend/data/productos-prueba.csv`).
- Importación parcial: las filas válidas se insertan y las erróneas (SKU repetido, campos inválidos, proveedor inexistente o inactivo) se guardan en `ImportJob` (máximo 500 errores).

## Despliegue en Render

| | Web Service (API) | Static Site (frontend) |
|---|---|---|
| Root Directory | `backend` | *(vacío)* |
| Build Command | `npm install` | `echo ok` |
| Start / Publish | `npm start` | `frontend` |
| Variables | `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` | — |

- Auto-deploy desde `main`.
- En Atlas → Network Access: permitir `0.0.0.0/0` (Render no tiene IP fija).
- `FRONTEND_URL` debe incluir la URL del Static Site sin barra final.

## Decisiones técnicas principales

- Errores centralizados en un middleware (`manejarErrores`); un duplicado (error 11000) indica el campo afectado.
- Rutas protegidas a nivel de router y roles por ruta.
- Proveedores y usuarios con baja lógica; `taxId` de proveedor único.
- CORS: un origen no permitido no recibe cabeceras (no devuelve 500); peticiones sin `Origin` (curl) permitidas.
- Analítica con `aggregate` de MongoDB solo sobre productos activos.
- Token en `localStorage` con escape de HTML en el frontend (mejora futura: cookie `httpOnly`).

## Problemas frecuentes

| Síntoma | Causa |
|---|---|
| `bad auth` al arrancar | Contraseña de Atlas desactualizada en `MONGODB_URI` |
| `Unable to parse … with URL` | `MONGODB_URI` mal pegada (falta la `@` entre contraseña y host) |
| El backend se queda colgado tras `injected env` | Tu IP no está en Atlas Network Access |
| Error de CORS en el navegador | La URL de Live Server no está en `FRONTEND_URL` (ojo `localhost` ≠ `127.0.0.1`) |
| `Missing script: start` en Render | Root Directory no es `backend` |
| Primera petición muy lenta en Render | El servicio gratuito estaba dormido |

## Equipo

Proyecto académico de The Bridge (Fullstack Developer):

- **Ali** (`aliciaperez01`): catálogo de productos, stock, movimientos y dashboard.
- **Coral**: autenticación y roles, usuarios, proveedores, importación CSV, analítica, Swagger y despliegue.
