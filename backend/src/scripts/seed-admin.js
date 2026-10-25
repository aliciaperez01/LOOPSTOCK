require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const User = require("../models/User");

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  // Bloque 1: validar configuración (MONGODB_URI la valida connectDB)
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en .env");
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres");
  }

  // Misma conexión que el servidor (dbName: "loopstock")
  await connectDB();

  // Bloque 2: idempotencia
  const existe = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existe) {
    console.log(`ℹ️  Ya existe un usuario con ${ADMIN_EMAIL}. No se crea nada.`);
    return;
  }

  // Bloque 3: crear admin
  const admin = await User.create({
    name: ADMIN_NAME || "Administrador",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });
  console.log(`✅ Admin creado: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error("❌ Error en seed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
