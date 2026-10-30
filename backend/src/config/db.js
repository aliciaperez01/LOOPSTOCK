const mongoose = require("mongoose");
const os = require("os");
require("dotenv").config();

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("Falta la variable MONGODB_URI en el archivo .env");
    }

    await mongoose.connect(uri, {
      dbName: "loopstock",
      appName: "loopstock-api",
      // El driver de MongoDB carga el módulo "os" con un import() dinámico
      // para construir el metadata de la conexión. Bajo Jest (sin el flag
      // --experimental-vm-modules) ese import() dinámico falla con
      // "A dynamic import callback was invoked without --experimental-vm-modules",
      // y el metadata queda incompleto → el servidor rechaza la conexión con
      // "Missing required sub-document 'driver' in the client metadata
      // document". Se le pasa el módulo "os" ya cargado para que no necesite
      // hacer el import() dinámico.
      runtimeAdapters: { os }
    });

    console.log("Conectado a MongoDB Atlas mediante Mongoose");
    return mongoose.connection;
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    throw error;
  }
}

module.exports = { connectDB };
