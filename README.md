# LOOPSTOCK

**Sistema de gestión de inventario para una tienda de equipos DJ y producción musical.**

LOOPSTOCK es una aplicación web que permite gestionar productos, controlar existencias, administrar proveedores, registrar movimientos de stock, importar productos mediante archivos CSV y consultar estadísticas del inventario.

El proyecto está desarrollado con una arquitectura cliente-servidor: una API REST construida con Node.js y Express, una base de datos MongoDB y un frontend desarrollado con HTML, CSS y JavaScript sin frameworks.

Incluye autenticación mediante JWT, control de acceso por roles, documentación interactiva de la API con Swagger y despliegue en Render.

---

## Demo en producción

| Servicio | URL |
|---|---|
| Frontend | https://loopstock-school.onrender.com/pages/login.html |
| API | https://loopstock.onrender.com/api |
| Swagger | https://loopstock.onrender.com/api/docs |

**Importante:** el plan gratuito de Render puede dejar el backend inactivo cuando no recibe peticiones. Por ello, la primera petición puede tardar aproximadamente 50 segundos en responder.

Para acceder a la aplicación, entrar siempre desde la página de inicio de sesión:

https://loopstock-school.onrender.com/pages/login.html

---

## Tecnologías utilizadas

### Backend
- Node.js 20 o superior.
- Express 5.
- MongoDB Atlas.
- Mongoose 9.
- JSON Web Tokens (JWT).
- bcryptjs para el hash de contraseñas.
- Multer para la recepción de archivos.
- csv-parse para procesar archivos CSV.
- swagger-jsdoc y swagger-ui-express para la documentación de la API.

### Frontend
- HTML5.
- CSS3.
- JavaScript.
- Fetch API para las peticiones HTTP.
- Autenticación mediante token Bearer.
- Diseño responsive mediante CSS y media queries.

### Despliegue y herramientas
- Git y GitHub para el control de versiones.
- Render para el despliegue del frontend y backend.
- MongoDB Atlas para la base de datos.
- Postman y herramientas de navegador para las pruebas.

---

## Funcionalidades principales

### 1. Autenticación y gestión de usuarios
- Inicio de sesión mediante credenciales.
- Autenticación con JWT.
- Consulta del usuario autenticado.
- Gestión de usuarios por parte del administrador.
- Control de acceso mediante roles.
- Protección de rutas tanto en frontend como en backend.

### 2. Gestión de productos
- Crear, consultar y editar productos.
- Identificación mediante SKU único.
- Búsqueda y filtrado por categoría.
- Control de cantidades y niveles mínimos de stock.
- Consulta de productos con stock bajo.
- Paginación del listado de productos.
- Control de permisos para las operaciones de eliminación.

### 3. Gestión de proveedores
- Alta y consulta de proveedores.
- Edición de información.
- Búsqueda de proveedores.
- Identificación fiscal mediante taxId único.
- Baja lógica de proveedores.

### 4. Movimientos de stock
- Registro de entradas y salidas de mercancía.
- Actualización de las cantidades disponibles.
- Seguimiento de los cambios de inventario.

### 5. Importación de productos mediante CSV
- Subida de archivos CSV.
- Validación del formato y los datos.
- Detección del separador del archivo.
- Comprobación de SKU duplicados.
- Validación de proveedores.
- Importación parcial: se incorporan las filas válidas y se registran los errores de las filas rechazadas.
- Historial de importaciones y consulta de resultados.

### 6. Analítica de inventario
- Resumen general del inventario.
- Número de productos y unidades.
- Valor del stock.
- Productos con stock bajo y agotados.
- Inventario agrupado por categoría.
- Inventario agrupado por proveedor.
- Estadísticas de importaciones y tasa de éxito.

### 7. Interfaz responsive
- Adaptación a ordenadores, tablets y móviles.
- Menú lateral adaptable.
- Formularios y filtros adaptados a diferentes tamaños de pantalla.
- Tablas y controles optimizados para dispositivos pequeños.
- Modo claro y oscuro.

---

## Estructura del proyecto

```text
LOOPSTOCK/
├── backend/
│   ├── data/
│   │   └── productos-prueba.csv
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── swagger.js
│   │   ├── controllers/
│   │   ├── docs/
│   │   │   └── Documentación Swagger por módulo
│   │   ├── middlewares/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Supplier.js
│   │   │   └── ImportJob.js
│   │   ├── routes/
│   │   ├── scripts/
│   │   │   └── seed-admin.js
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── products.html
│   │   ├── product-form.html
│   │   ├── suppliers.html
│   │   ├── imports.html
│   │   ├── movements.html
│   │   └── users.html
│   ├── js/
│   │   ├── config.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── Scripts de los distintos módulos
│   └── css/
│
├── CHECKLIST_TRABAJO.md
└── README.md
```

---

## Instalación y ejecución en local

### Requisitos previos

- Node.js 20 o superior.
- npm.
- MongoDB local o una cuenta de MongoDB Atlas.
- Visual Studio Code.
- Extensión Live Server para ejecutar el frontend.

### 1. Clonar el repositorio

```bash
git clone https://github.com/aliciaperez01/LOOPSTOCK.git
cd LOOPSTOCK/backend
npm install
```

Todos los comandos de npm deben ejecutarse desde la carpeta `backend/`.

### 2. Configurar las variables de entorno

Copiar el archivo `.env.example` y crear un archivo `.env` dentro de `backend/`.

Completar las siguientes variables:

| Variable | Descripción |
|---|---|
| PORT | Puerto del servidor. Ejemplo: 3001. |
| NODE_ENV | Entorno de ejecución: development o production. |
| MONGODB_URI | Cadena de conexión a MongoDB. |
| JWT_SECRET | Clave secreta para firmar los tokens. |
| JWT_EXPIRES_IN | Tiempo de expiración del token. Ejemplo: 1h. |
| FRONTEND_URL | Orígenes permitidos por CORS, separados por comas y sin barra final. |
| ADMIN_NAME | Nombre del primer administrador. |
| ADMIN_EMAIL | Correo del primer administrador. |
| ADMIN_PASSWORD | Contraseña inicial del administrador. |

Ejemplo de configuración local:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:contraseña@host/...
JWT_SECRET=una_clave_larga_y_aleatoria
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5500,http://127.0.0.1:5500
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@loopstock.com
ADMIN_PASSWORD=contraseña_segura
```

El servidor necesita `MONGODB_URI` y `JWT_SECRET` para arrancar. En producción también necesita `FRONTEND_URL`.

**No subir nunca el archivo `.env` a GitHub.**

### 3. Crear el primer administrador

Desde `backend/`:

```bash
npm run seed:admin
```

El script es idempotente: si ya existe un usuario con ese correo electrónico, no crea otro administrador.

### 4. Arrancar el backend

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

Direcciones locales:

- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

### 5. Arrancar el frontend

Abrir el proyecto con Visual Studio Code y utilizar Live Server sobre:

```text
frontend/pages/login.html
```

La dirección local será normalmente:

```text
http://localhost:5500/pages/login.html
```

El archivo `frontend/js/config.js` permite utilizar la API local durante el desarrollo y la API desplegada en Render cuando se ejecuta desde el dominio de producción.

---

## Roles y permisos

LOOPSTOCK dispone de dos roles principales:

| Funcionalidad | Administrador | Empleado |
|---|---|---|
| Consultar productos | Sí | Sí |
| Crear productos | Sí | Sí |
| Editar productos | Sí | Sí |
| Eliminar productos | Sí | No |
| Consultar proveedores | Sí | Sí |
| Crear y editar proveedores | Sí | No |
| Gestionar importaciones CSV | Sí | No |
| Gestionar usuarios | Sí | No |
| Consultar analítica | Sí | Sí |

Los permisos se comprueban en el backend mediante los middlewares de autenticación y autorización por roles.

La ocultación de botones en el frontend es únicamente una medida de usabilidad: la seguridad real se aplica en el servidor.

---

## API REST

La API utiliza rutas REST y devuelve información en formato JSON.

Todas las rutas, excepto `POST /api/auth/login`, requieren autenticación mediante la cabecera:

```http
Authorization: Bearer <token>
```

La documentación interactiva y los detalles de los parámetros, respuestas y códigos HTTP están disponibles en Swagger:

https://loopstock.onrender.com/api/docs

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Inicio de sesión y obtención del JWT. |
| GET | `/api/auth/me` | Autenticado | Consulta del usuario de la sesión. |

### Productos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products` | Admin y empleado | Listado de productos, búsqueda y filtros. |
| GET | `/api/products/low-stock` | Admin y empleado | Productos con stock bajo. |
| GET | `/api/products/:id` | Admin y empleado | Consulta de un producto. |
| POST | `/api/products` | Admin y empleado | Creación de productos. |
| PUT | `/api/products/:id` | Admin y empleado | Edición de productos. |
| DELETE | `/api/products/:id` | Admin | Eliminación o desactivación según la lógica implementada. |

La consulta de productos admite filtros como categoría y búsqueda, además de paginación.

### Proveedores

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/suppliers` | Admin y empleado | Listado y búsqueda. |
| GET | `/api/suppliers/:id` | Admin y empleado | Consulta de un proveedor. |
| POST | `/api/suppliers` | Admin | Alta de proveedores. |
| PUT | `/api/suppliers/:id` | Admin | Edición de proveedores. |
| DELETE | `/api/suppliers/:id` | Admin | Baja lógica de proveedores. |

### Importaciones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/imports` | Admin | Subida e importación de CSV. |
| GET | `/api/imports` | Admin | Historial de importaciones. |
| GET | `/api/imports/:id` | Admin | Resumen y errores de una importación. |

### Usuarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/users` | Admin | Listado de usuarios. |
| POST | `/api/users` | Admin | Creación de usuarios. |
| DELETE | `/api/users/:id` | Admin | Baja lógica de usuarios. |

Un administrador no puede desactivarse a sí mismo.

### Analítica

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/analytics/summary` | Admin y empleado | Resumen general del inventario. |
| GET | `/api/analytics/by-category` | Admin y empleado | Inventario agrupado por categoría. |
| GET | `/api/analytics/by-supplier` | Admin y empleado | Inventario agrupado por proveedor. |
| GET | `/api/analytics/imports` | Admin y empleado | Estadísticas de importaciones. |

### Movimientos de stock

El proyecto incluye un módulo específico para registrar las entradas y salidas de mercancía y actualizar las cantidades del inventario.

Para consultar los métodos, parámetros y respuestas exactas de sus rutas, se debe utilizar la implementación del módulo y su documentación técnica correspondiente.

---

## Importación CSV

El sistema permite importar varios productos mediante archivos CSV.

### Características

- Subida mediante Multer en memoria.
- Tamaño máximo del archivo: 2 MB.
- Admisión de archivos `.csv`, con validación de extensión y MIME.
- Detección automática del separador `;` o `,` a partir de la cabecera.
- Validación de los campos y de los proveedores.
- Detección de SKU duplicados.

### Columnas esperadas

```text
sku;name;brand;category;quantity;price;cost;minStock;supplier
```

Existe un archivo de ejemplo en:

```text
backend/data/productos-prueba.csv
```

### Importación parcial

La importación permite procesar las filas válidas aunque otras contengan errores.

Los registros rechazados, por ejemplo por SKU duplicado, campos inválidos o proveedores inexistentes o inactivos, se guardan en el historial de importaciones (`ImportJob`).

Se almacena un máximo de 500 errores por importación.

---

## Despliegue en Render

El despliegue utiliza dos servicios:

| Configuración | Backend | Frontend |
|---|---|---|
| Tipo | Web Service | Static Site |
| Root Directory | `backend` | Vacío |
| Build Command | `npm install` | `echo ok` |
| Start / Publish | `npm start` | `frontend` |
| Despliegue | Automático desde `main` | Automático desde `main` |

### Variables de entorno del backend

Configurar en Render:

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`

`FRONTEND_URL` debe contener la dirección del Static Site sin barra final.

### MongoDB Atlas

En Network Access hay que permitir la conexión desde Render. En la configuración utilizada por el proyecto se ha habilitado `0.0.0.0/0`, ya que Render no proporciona una IP fija para este servicio.

---

## Decisiones técnicas

- **Separación frontend/backend:** permite mantener la interfaz independiente de la lógica de negocio y la API.
- **Autenticación JWT:** las peticiones protegidas requieren un token válido.
- **Autorización por roles:** el backend comprueba los permisos antes de ejecutar las operaciones.
- **Contraseñas:** se almacenan mediante hash con bcryptjs.
- **Validación de datos:** los modelos y controladores validan la información recibida.
- **Errores centralizados:** se utiliza un middleware común para gestionar errores.
- **Duplicados:** los errores de MongoDB con código `11000` permiten identificar conflictos de campos únicos.
- **Bajas lógicas:** se utilizan para gestionar proveedores y usuarios sin eliminar físicamente sus registros.
- **CORS:** se configura mediante `FRONTEND_URL`, permitiendo los orígenes autorizados y las peticiones sin cabecera Origin.
- **Analítica:** se utilizan operaciones de agregación de MongoDB para calcular estadísticas del inventario.
- **Documentación API:** Swagger permite consultar y probar los endpoints disponibles.
- **Responsive:** se emplean media queries para adaptar la interfaz a diferentes dispositivos.

El token se almacena actualmente en `localStorage`. Una posible mejora futura sería utilizar cookies `httpOnly` para reducir la exposición del token frente a determinados ataques en el navegador.

---

## Problemas frecuentes

| Síntoma | Posible causa |
|---|---|
| `bad auth` al arrancar | Credenciales de MongoDB Atlas incorrectas o desactualizadas. |
| `Unable to parse ... with URL` | Cadena `MONGODB_URI` mal formada. |
| El backend no conecta con Atlas | La IP de conexión no está permitida en Network Access. |
| Error CORS en el navegador | El origen de Live Server no está incluido en `FRONTEND_URL`. |
| `Missing script: start` en Render | Root Directory configurado incorrectamente. |
| Primera petición muy lenta en Render | El servicio gratuito estaba inactivo. |
| Error 401 | Token ausente, incorrecto o caducado. |
| Error 403 | El usuario autenticado no tiene permisos para realizar la operación. |

---

## Equipo y reparto de responsabilidades

Proyecto académico desarrollado en The Bridge (Fullstack Developer).

### Ali (aliciaperez01)

Responsable de las funcionalidades relacionadas con el catálogo y el control de productos:

- Modelo y gestión de productos.
- Control de stock.
- CRUD de productos.
- Formularios y páginas de productos.
- Paginación del catálogo.
- Movimientos de stock.
- Dashboard.
- Redirección de la página principal (`index.html`).
- Conexión de las páginas de productos con la autenticación.
- Documentación específica del módulo de productos en el README: endpoints, filtros y paginación.
- Documentación Swagger del módulo de productos (`products.yaml`).

### Coral

Responsable de las funcionalidades de autenticación, administración y servicios complementarios:

- Autenticación y JWT.
- Roles y permisos.
- Gestión de usuarios.
- Gestión de proveedores.
- Importación de productos mediante CSV.
- Analítica del inventario.
- Configuración general de Swagger.
- Documentación Swagger de los módulos asignados: autenticación, proveedores, importaciones, usuarios y analítica.
- Configuración de CORS y variables de entorno.
- Configuración y despliegue en Render.
- Documentación general del proyecto en el README: instalación, variables de entorno, scripts, endpoints, roles, despliegue y decisiones técnicas.

### Trabajo conjunto

Ambas integrantes participaron en los puntos de integración y cierre del proyecto:

- Revisión e integración de cambios mediante Git y GitHub.
- Revisión cruzada de Pull Requests.
- Integración de los módulos en la rama principal.
- Pruebas funcionales con los roles de administrador y empleado.
- Verificación del funcionamiento de la aplicación desplegada.
- Revisión de la interfaz y adaptación responsive.
- Comprobación de requisitos y preparación de la presentación técnica.

---

## Control de versiones y colaboración

El proyecto se ha desarrollado utilizando Git y GitHub para mantener el control de versiones y facilitar la colaboración.

Se ha trabajado mediante ramas y Pull Requests, con revisión cruzada de cambios antes de integrarlos en la rama principal `main`.

Este sistema ha permitido separar las tareas por módulos, reducir conflictos y mantener una versión común del proyecto.

---

## Posibles mejoras futuras

- Incorporar cookies `httpOnly` para la gestión de sesiones.
- Ampliar los informes y gráficos de analítica.
- Añadir notificaciones de stock bajo.
- Mejorar las opciones de exportación de inventario.
- Ampliar las pruebas automatizadas de integración.
- Incorporar nuevas herramientas de seguimiento y gestión del inventario.

---

**LOOPSTOCK — Gestión de inventario para equipos DJ y producción musical.**