const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const suppliersRoutes = require("./routes/suppliers.routes");
const importsRoutes = require("./routes/imports.routes");
const usersRoutes = require("./routes/users.routes");
const swaggerSpec = require("./config/swagger");

const logger = require("./middlewares/logger");
const noEncontrada = require("./middlewares/noEncontrada");
const manejarErrores = require("./middlewares/manejarErrores");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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
