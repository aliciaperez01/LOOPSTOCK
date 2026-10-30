const request = require("supertest");
const { iniciar, limpiarBD, finalizar } = require("../helpers/db");

let app;
let User;

const CSV_VALIDO =
  "sku,name,category,quantity,price,minstock\n" +
  "DDJ-TEST1,Controladora de prueba,Controladoras,5,299,1\n" +
  "DDJ-TEST2,Otra controladora,Controladoras,3,199,1\n";

const CSV_PARCIAL =
  "sku,name,category,quantity,price\n" +
  "DDJ-TEST1,Controladora de prueba,Controladoras,5,299\n" + // válida
  "DDJ-TEST1,Duplicado del mismo archivo,Controladoras,2,100\n" + // SKU repetido
  ",Sin SKU,Controladoras,1,50\n"; // campo obligatorio vacío

async function crearUsuario(User, { role = "admin", email = "admin@test.com" } = {}) {
  return User.create({ name: "Test", email, password: "password123", role });
}

async function obtenerToken(app, email) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return res.body.token;
}

beforeAll(async () => {
  app = await iniciar();
  User = require("../../src/models/User");
}, 300000); // 5 min: la primera vez descarga el binario de Mongo

afterEach(limpiarBD);

afterAll(finalizar, 30000);

describe("POST /api/imports", () => {
  test("sin token → 401", async () => {
    const res = await request(app)
      .post("/api/imports")
      .attach("file", Buffer.from(CSV_VALIDO), "productos.csv");
    expect(res.status).toBe(401);
  });

  test("con empleado (no admin) → 403", async () => {
    await crearUsuario(User, { role: "empleado", email: "empleado@test.com" });
    const token = await obtenerToken(app, "empleado@test.com");

    const res = await request(app)
      .post("/api/imports")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(CSV_VALIDO), "productos.csv");
    expect(res.status).toBe(403);
  });

  test("archivo que no es CSV (.txt) → 400", async () => {
    await crearUsuario(User);
    const token = await obtenerToken(app, "admin@test.com");

    const res = await request(app)
      .post("/api/imports")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("esto no es un csv"), "notas.txt");
    expect(res.status).toBe(400);
  });

  test("CSV válido → 201 y los productos quedan en la base de datos", async () => {
    await crearUsuario(User);
    const token = await obtenerToken(app, "admin@test.com");

    const res = await request(app)
      .post("/api/imports")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(CSV_VALIDO), "productos.csv");

    expect(res.status).toBe(201);
    expect(res.body.importacion.status).toBe("completed");
    expect(res.body.importacion.insertedRows).toBe(2);

    const Product = require("../../src/models/Product");
    const guardados = await Product.find({});
    expect(guardados).toHaveLength(2);
  });

  test("CSV con filas inválidas → 201 pero importación parcial, con errorRows", async () => {
    await crearUsuario(User);
    const token = await obtenerToken(app, "admin@test.com");

    const res = await request(app)
      .post("/api/imports")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(CSV_PARCIAL), "productos.csv");

    expect(res.status).toBe(201);
    expect(res.body.importacion.status).toBe("partial");
    expect(res.body.importacion.insertedRows).toBe(1);
    expect(res.body.importacion.errorRows).toBe(2);
  });
});

describe("GET /api/imports/:id", () => {
  test("id con formato no válido → 400", async () => {
    await crearUsuario(User);
    const token = await obtenerToken(app, "admin@test.com");

    const res = await request(app)
      .get("/api/imports/no-es-un-id")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test("id con formato válido pero inexistente → 404", async () => {
    await crearUsuario(User);
    const token = await obtenerToken(app, "admin@test.com");

    const res = await request(app)
      .get("/api/imports/652f1f2b1c4a2a0012345678")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test("detalle de una importación con errores por fila → 200", async () => {
    await crearUsuario(User);
    const token = await obtenerToken(app, "admin@test.com");

    const importacion = await request(app)
      .post("/api/imports")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(CSV_PARCIAL), "productos.csv");

    const res = await request(app)
      .get(`/api/imports/${importacion.body.importacion._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.rowErrors).toHaveLength(2);
  });
});
