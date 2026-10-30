require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Supplier = require("../models/Supplier");

// Uso único (T17): sustituye el índice antiguo name_1 por name_unico_ci
async function main() {
  await connectDB();

  // Bloque 1: detectar nombres repetidos sin distinguir mayúsculas
  const repetidos = await Supplier.aggregate([
    { $group: { _id: "$name", total: { $sum: 1 }, nombres: { $push: "$name" } } },
    { $match: { total: { $gt: 1 } } }
  ]).collation({ locale: "es", strength: 2 });

  if (repetidos.length) {
    console.log("❌ Hay proveedores con el mismo nombre. Renómbralos antes de seguir:");
    repetidos.forEach((r) => console.log("  -", r.nombres.join(" | ")));
    process.exitCode = 1;
    return;
  }

  // Bloque 2: borrar índices que ya no están en el esquema y crear los nuevos
  const borrados = await Supplier.syncIndexes();
  console.log("🗑️  Índices borrados:", borrados.length ? borrados.join(", ") : "ninguno");

  const indices = await Supplier.collection.indexes();
  console.log("✅ Índices actuales:", indices.map((i) => i.name).join(", "));
}

main()
  .catch((error) => {
    console.error("❌", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
