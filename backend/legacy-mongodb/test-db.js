
const { connectDB, client } = require("./db");

async function testConnection() {
  try {
    const db = await connectDB();
    await db.command({ ping: 1 });

    console.log("¡Conexión correcta con MongoDB Atlas!");
    console.log("Base de datos:", db.databaseName);
  } catch (error) {
    console.error("No se pudo conectar:", error.message);
  } finally {
    await client.close();
  }
}

testConnection();
