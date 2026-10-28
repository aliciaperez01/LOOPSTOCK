const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

// Parte común de la documentación: info, seguridad y esquemas compartidos.
// Los endpoints se describen en src/docs/*.yaml (un archivo por módulo).
const definition = {
  openapi: "3.0.3",
  info: {
    title: "LoopStock API",
    version: "1.0.0",
    description:
      "API REST de inventario para una tienda de equipos DJ y producción musical. " +
      "Para probar las rutas protegidas: haz login en POST /api/auth/login, " +
      "copia el token y pégalo en el botón **Authorize**."
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  tags: [
    { name: "Auth", description: "Login y usuario actual" },
    { name: "Proveedores", description: "CRUD de proveedores (baja lógica)" },
    { name: "Importaciones", description: "Importación de productos desde CSV (solo admin)" },
    { name: "Usuarios", description: "Alta, listado y baja lógica de usuarios (solo admin)" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string", example: "Token no proporcionado" } }
      },
      ErrorValidacion: {
        type: "object",
        properties: {
          error: { type: "string", example: "Error de validación" },
          detalles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                campo: { type: "string", example: "name" },
                mensaje: { type: "string", example: "El nombre del proveedor es obligatorio" }
              }
            }
          }
        }
      },
      ErrorDuplicado: {
        type: "object",
        properties: {
          error: { type: "string", example: 'Ya existe un registro con ese valor de "name"' },
          campo: { type: "string", example: "name" }
        }
      }
    },
    parameters: {
      IdMongo: {
        name: "id",
        in: "path",
        required: true,
        description: "ObjectId de MongoDB",
        schema: { type: "string", example: "6718f0c2a1b2c3d4e5f60789" }
      }
    },
    responses: {
      NoAutenticado: {
        description: "Falta el token o es inválido o ha caducado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      },
      SinPermiso: {
        description: "El rol del usuario no tiene permiso",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "No tienes permisos para esta acción" }
          }
        }
      },
      NoEncontrado: {
        description: "No existe ningún registro con ese id",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      },
      IdNoValido: {
        description: "El id no tiene formato de ObjectId",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      }
    }
  }
};

// Ruta absoluta (no depende de la carpeta desde la que se arranque) y con "/",
// porque swagger-jsdoc usa glob y en Windows path.join devuelve "\"
const carpetaDocs = path.join(__dirname, "..", "docs").replace(/\\/g, "/");

const swaggerSpec = swaggerJsdoc({
  definition,
  apis: [`${carpetaDocs}/*.yaml`]
});

module.exports = swaggerSpec;
