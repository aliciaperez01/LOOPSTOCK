
const express = require("express");
const cors = require("cors");

const productRoutes = require("./product.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API de Loopstock funcionando"
  });
});

// Rutas para gestionar productos
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de Loopstock escuchando en http://localhost:${PORT}`);
});
