const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

// Mongo en memoria para los tests. Las variables se fijan antes de cargar server.js
async function iniciar() {
  // Versión 7 para que la primera descarga sea más rápida
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
  // Solo si hay conexión (1 = conectado)
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) await mongod.stop();
}

module.exports = { iniciar, limpiarBD, finalizar };
