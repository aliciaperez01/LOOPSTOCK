require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "loopstock" });

  const db = mongoose.connection.db;

  const products = await db.collection("products").find({}).toArray();
  const suppliers = await db.collection("suppliers").find({}).toArray();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const output = path.join(__dirname, `backup-${timestamp}.json`);

  fs.writeFileSync(
    output,
    JSON.stringify(
      {
        database: mongoose.connection.name,
        createdAt: new Date().toISOString(),
        products,
        suppliers
      },
      null,
      2
    )
  );

  console.log("Copia creada:", output);
  console.log("Productos guardados:", products.length);
  console.log("Proveedores guardados:", suppliers.length);

  await mongoose.disconnect();
}

main().catch(async error => {
  console.error("Error al crear la copia:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});