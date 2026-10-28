const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("Falta la variable MONGODB_URI en el archivo .env");
    }

    await mongoose.connect(uri, {
      dbName: "loopstock"
    });

    console.log("Conectado a MongoDB Atlas mediante Mongoose");
    return mongoose.connection;
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    throw error;
  }
}

module.exports = { connectDB };
