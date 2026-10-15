# LoopStock

**Sistema de gestión de inventario para equipos DJ y producción musical.**

LoopStock es una aplicación web diseñada para gestionar el inventario de una tienda de equipos DJ, producción musical y material de estudio. Permite centralizar el catálogo de productos, controlar las existencias y registrar los movimientos de stock.

## Funcionalidades previstas

- Gestión de productos: crear, consultar, editar y eliminar.
- Gestión de proveedores.
- Control de inventario: entradas, salidas y ajustes de stock.
- Alertas de stock bajo.
- Importación de productos mediante archivos CSV.
- Dashboard con estadísticas del inventario.
- Autenticación con JWT y control de permisos por roles.
- Documentación de la API mediante Swagger.

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
- Jest y Supertest (previstos)
- MongoDB Atlas
- Render

## Estructura del proyecto

```text
LoopStock/
├── backend/
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

- **Admin:** gestión del catálogo, proveedores, importaciones y operaciones administrativas.
- **Empleado:** consulta del inventario y registro de movimientos, según los permisos establecidos.

Los permisos se validarán en el backend, no solamente en la interfaz.

## Instalación y ejecución

### Requisitos previos

- Node.js y npm.
- MongoDB local o MongoDB Atlas.
- Git.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd LoopStock
```

### 2. Instalar dependencias

```bash
cd backend
npm install
```

### 3. Configurar las variables de entorno

Crear un archivo `.env` en `backend/`, utilizando `.env.example` como referencia.

Variables previstas:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5500
```

Completar los valores antes de iniciar el servidor. No publicar credenciales ni secretos.

### 4. Iniciar el backend

El comando de inicio dependerá de los scripts definidos en `backend/package.json`.

### 5. Abrir el frontend

Durante el desarrollo, se podrá utilizar Live Server de Visual Studio Code. La dirección del frontend deberá coincidir con la configuración CORS del backend.

## API

Los endpoints se organizarán bajo el prefijo `/api`.

| Recurso | Funcionalidad |
|---|---|
| `/api/auth` | Autenticación |
| `/api/products` | Productos |
| `/api/suppliers` | Proveedores |
| `/api/movements` | Movimientos de inventario |
| `/api/imports` | Importaciones CSV |
| `/api/analytics` | Estadísticas |

Las rutas definitivas se documentarán durante la implementación.

## Datos iniciales

El archivo `data/stock-inicial.csv` contendrá datos ficticios creados por el equipo para probar el catálogo y la importación de productos.

## Despliegue previsto

- **Backend:** Render Web Service.
- **Frontend:** Render Static Site.
- **Base de datos:** MongoDB Atlas.

Las variables de entorno se configurarán en el entorno de despliegue. No se dependerá del almacenamiento local de Render para conservar archivos de forma permanente.

## Equipo

Proyecto académico desarrollado en equipo por dos integrantes.

## Estado del proyecto

En desarrollo. Las funcionalidades descritas son objetivos previstos y se actualizarán conforme se implementen y prueben.

## Licencia

Proyecto académico. La licencia se definirá si se decide distribuirlo públicamente.
