# LoopStock

**Sistema de gestión de inventario para equipos DJ y producción musical.**

LoopStock es una aplicación web diseñada para gestionar el inventario de una tienda de equipos DJ, producción musical y material de estudio. Permite centralizar el catálogo de productos, controlar las existencias, gestionar proveedores y registrar los movimientos de stock.

## Funcionalidades

### Gestión de productos
- Crear, consultar, editar y eliminar productos.
- Buscar productos por nombre, SKU, categoría o proveedor.
- Filtrar productos por categoría y estado del stock.
- Consultar productos con stock bajo.
- Consultar estadísticas del inventario.
- Paginación de los resultados.
- Validación de SKU duplicados y datos de productos.

### Gestión de inventario
- Registrar entradas y salidas de stock.
- Actualizar automáticamente las existencias al registrar movimientos.
- Consultar el historial de movimientos.
- Evitar salidas que provoquen stock negativo.

### Seguridad y usuarios
- Autenticación mediante JWT.
- Control de acceso según el rol del usuario.
- Diferenciación entre administradores y empleados.
- Protección de las rutas del backend.
- Cierre de sesión y protección de páginas privadas.

### Otras funcionalidades
- Gestión de proveedores.
- Importación de productos mediante archivos CSV.
- Dashboard con estadísticas y alertas de inventario.
- Documentación de la API mediante Swagger (en desarrollo).

## Tecnologías

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Multer
- Swagger

### Frontend
- HTML5
- CSS3
- JavaScript

### Pruebas y despliegue
- Jest y Supertest (pendientes de completar y verificar).
- MongoDB Atlas.
- Render.

## Estructura del proyecto

```text
LoopStock/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── docs/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── pages/
│   ├── css/
│   ├── js/
│   └── assets/
│       └── icons/
├── data/
│   └── stock-inicial.csv
├── docs/
│   └── decisiones-arquitectura.md
├── .gitignore
└── README.md
```

## Categorías de productos

- **Equipos DJ:** controladoras, reproductores, mezcladores y platos.
- **Producción musical:** sintetizadores, cajas de ritmos, samplers y controladores MIDI.
- **Estudio y grabación:** interfaces de audio, micrófonos y monitores.
- **Accesorios:** cables, adaptadores, fundas y flight cases.

## Roles de usuario

### Administrador
- Gestión del catálogo de productos.
- Gestión de proveedores.
- Operaciones administrativas.
- Acceso a las funciones restringidas a administradores.

### Empleado
- Consulta del inventario.
- Registro de movimientos de stock.
- Acceso a las funciones permitidas para su rol.

Los permisos se validan en el backend y no solamente en la interfaz.

## Instalación y ejecución

### Requisitos previos

- Node.js.
- npm.
- MongoDB local o MongoDB Atlas.
- Git.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd LOOPSTOCK
```

### 2. Instalar dependencias

```bash
cd backend
npm install
```

### 3. Configurar las variables de entorno

Crear un archivo `.env` dentro de `backend/`, utilizando `.env.example` como referencia.

Ejemplo de configuración:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5500
```

Los valores deben adaptarse al entorno de ejecución. No se deben publicar credenciales ni secretos.

### 4. Iniciar el backend

Desde la carpeta `backend`, ejecutar el script de inicio definido en `package.json`.

Por ejemplo, si está disponible el script `dev`:

```bash
npm run dev
```

### 5. Abrir el frontend

Durante el desarrollo se puede utilizar Live Server de Visual Studio Code.

La dirección del frontend debe coincidir con la configuración CORS del backend.

## API

Los endpoints están organizados bajo el prefijo `/api`.

| Recurso | Funcionalidad |
|---|---|
| `/api/auth` | Autenticación |
| `/api/products` | Gestión de productos |
| `/api/suppliers` | Gestión de proveedores |
| `/api/movements` | Movimientos de inventario |
| `/api/imports` | Importaciones CSV |
| `/api/analytics` | Estadísticas y análisis |


## Gestión de productos

La API de productos permite gestionar el catálogo, consultar existencias y controlar los niveles de stock.

### Endpoints

| Método | Endpoint | Funcionalidad |
|---|---|---|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Consultar un producto por ID |
| POST | `/api/products` | Crear un producto |
| PUT | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto (administrador) |
| GET | `/api/products/stats` | Consultar estadísticas |
| GET | `/api/products/categories` | Obtener categorías |
| GET | `/api/products/low-stock` | Consultar productos con stock bajo |

### Filtros y búsqueda

El listado de productos permite utilizar los siguientes parámetros:

| Parámetro | Funcionalidad |
|---|---|
| `search` | Buscar por nombre, SKU, categoría o proveedor |
| `category` | Filtrar por categoría |
| `stock=available` | Productos con stock disponible |
| `stock=low` | Productos con stock bajo |
| `stock=out` | Productos sin existencias |

Ejemplo:

```http
GET /api/products?search=Pioneer&stock=available
```

### Paginación

El listado permite controlar el número de resultados mediante los parámetros `page` y `limit`.

Ejemplo:

```http
GET /api/products?page=2&limit=5
```

La respuesta utiliza la siguiente estructura:

```json
{
  "items": [],
  "total": 44,
  "page": 2,
  "pages": 9
}
```

- `items`: productos de la página actual.
- `total`: número total de productos que cumplen los filtros.
- `page`: página actual.
- `pages`: número total de páginas.

Los valores del ejemplo son ilustrativos.

### Validaciones y respuestas HTTP

La API contempla las siguientes respuestas:

| Código | Significado |
|---|---|
| 200 | Operación realizada correctamente |
| 201 | Producto creado correctamente |
| 400 | Datos incorrectos o ID no válido |
| 401 | Falta autenticación o el token no es válido |
| 403 | Usuario sin permisos suficientes |
| 404 | Producto no encontrado |
| 409 | Conflicto por SKU duplicado |
| 500 | Error interno del servidor |

## Movimientos de inventario

El módulo de movimientos permite registrar operaciones que modifican las existencias de los productos.

Los movimientos contemplan:

- **Entrada:** incrementa la cantidad disponible.
- **Salida:** reduce la cantidad disponible.
- Registro del producto afectado.
- Registro de la cantidad.
- Asociación del movimiento al usuario que lo realiza.
- Consulta del historial de movimientos.

El sistema evita que una salida genere un stock negativo.

## Datos iniciales

El archivo `data/stock-inicial.csv` contiene datos ficticios creados por el equipo para probar el catálogo y la importación de productos.

## Despliegue

El despliegue previsto utiliza:

- **Backend:** Render Web Service.
- **Frontend:** Render Static Site.
- **Base de datos:** MongoDB Atlas.

Las variables de entorno se configurarán en el entorno de despliegue.

No se dependerá del almacenamiento local de Render para conservar archivos de forma permanente.

## Equipo

Proyecto académico desarrollado en equipo por dos integrantes.

## Estado del proyecto

LoopStock se encuentra en desarrollo.

Las funcionalidades implementadas se prueban durante su desarrollo y otras secciones continúan pendientes de completar, integrar o documentar.

## Licencia

Proyecto académico. La licencia se definirá si se decide distribuirlo públicamente.
\