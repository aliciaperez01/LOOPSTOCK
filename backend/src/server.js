const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const esProduccion = process.env.NODE_ENV === "production";

// ── Validación de variables obligatorias ──────────────────────────
// En producción también se exige FRONTEND_URL para no dejar CORS abierto.
const REQUIRED_VARS = ["JWT_SECRET", "MONGODB_URI"];
if (esProduccion) REQUIRED_VARS.push("FRONTEND_URL");
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length) {
  console.error(
    `❌ Faltan variables de entorno obligatorias: ${missing.join(", ")}`
  );
  process.exit(1);
}

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const suppliersRoutes = require("./routes/suppliers.routes");
const importsRoutes = require("./routes/imports.routes");
const movementsRoutes = require("./routes/movements.routes");
const usersRoutes = require("./routes/users.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const swaggerSpec = require("./config/swagger");
const logger = require("./middlewares/logger");
const noEncontrada = require("./middlewares/noEncontrada");
const manejarErrores = require("./middlewares/manejarErrores");

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS configurado ──────────────────────────────────────────────
// FRONTEND_URL admite varias URLs separadas por comas (local + Render).
// Se quita la barra final porque el navegador envía el Origin sin ella.
if (process.env.FRONTEND_URL) {
  const allowedOrigins = process.env.FRONTEND_URL
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // origin es undefined en peticiones sin navegador (curl, Postman, Swagger
        // servido por la propia API), así que se permiten.
        // Con un origen no permitido se responde sin cabeceras CORS (false):
        // el navegador bloquea la respuesta y la API no devuelve un 500.
        callback(null, !origin || allowedOrigins.includes(origin));
      },
    })
  );
} else {
  console.warn("⚠️  FRONTEND_URL no definida → CORS abierto (solo desarrollo)");
  app.use(cors());
}

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API de Loopstock funcionando"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/imports", importsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/movements", movementsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Documentación interactiva (Swagger UI) y especificación en JSON
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

// Las rutas inexistentes deben gestionarse antes del middleware de errores.
app.use(noEncontrada);
app.use(manejarErrores);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Servidor de Loopstock escuchando en http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
