const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

// Arranca una base de datos Mongo en memoria y fija las variables de entorno
// ANTES de que algún test haga require("../../src/server"). En NODE_ENV=test,
// server.js NO conecta a la base de datos por su cuenta (ver startServer()):
// es este helper quien llama a connectDB() directamente y espera el
// resultado, para que un fallo de conexión se vea aquí como un error normal
// de test en vez de perderse en un process.exit() sin mensaje visible.
async function iniciar() {
  // Se fija una versión concreta (más pequeña que la 8.x por defecto) para que
  // la descarga del binario, la primera vez, sea más rápida y no dé timeout.
  // Queda en caché tras la primera ejecución (ver "npm test" con --runInBand).
  mongod = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = "test_secret_no_usar_en_produccion";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.NODE_ENV = "test";

  const { connectDB } = require("../../src/config/db");
  await connectDB();

  const app = require("../../src/server");

  return app;
}

async function limpiarBD() {
  const colecciones = mongoose.connection.collections;
  for (const nombre of Object.keys(colecciones)) {
    await colecciones[nombre].deleteMany({});
  }
}

async function finalizar() {
  // readyState === 1 → conectado. Si beforeAll falló antes de conectar,
  // no hay nada que limpiar ni que cerrar, y llamar a dropDatabase()/close()
  // sin conexión puede colgarse hasta el timeout del hook.
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) await mongod.stop();
}

module.exports = { iniciar, limpiarBD, finalizar };
