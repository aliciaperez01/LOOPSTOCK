const request = require("supertest");

const {
  iniciar,
  limpiarBD,
  finalizar
} = require("../helpers/db");

let app;
let token;
let Product;
let ImportJob;
let User;

async function crearProducto(datos = {}) {
  return Product.create({
    name: "Mesa de mezclas",
    sku: `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category: "DJ",
    price: 500,
    cost: 300,
    quantity: 5,
    minStock: 2,
    supplier: "Proveedor Test",
    ...datos
  });
}

beforeAll(async () => {
  app = await iniciar();

  Product = require("../../src/models/Product");
  ImportJob = require("../../src/models/ImportJob");
  User = require("../../src/models/User");
});

beforeEach(async () => {
  const usuario = await User.create({
    name: "Administrador Analytics",
    email: "admin.analytics@test.com",
    password: "Password123",
    role: "admin"
  });

  const respuestaLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin.analytics@test.com",
      password: "Password123"
    });

  expect(respuestaLogin.statusCode).toBe(200);
  token = respuestaLogin.body.token;

  global.usuarioAnalyticsId = usuario._id;
});

afterEach(async () => {
  await limpiarBD();
  delete global.usuarioAnalyticsId;
});

afterAll(async () => {
  await finalizar();
});

// ==========================================
// T08 - ANALÍTICAS DEL INVENTARIO
// ==========================================

describe("Analytics: resumen general", () => {
  test("devuelve ceros cuando no hay productos", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toMatchObject({
      totalProducts: 0,
      totalUnits: 0,
      stockValue: 0,
      stockCost: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categoriesCount: 0
    });
  });

  test("calcula correctamente las estadísticas del inventario", async () => {
    await crearProducto({
      sku: "ANALYTICS-001",
      quantity: 5,
      price: 100,
      cost: 60,
      minStock: 2,
      category: "DJ"
    });

    await crearProducto({
      sku: "ANALYTICS-002",
      quantity: 1,
      price: 200,
      cost: 120,
      minStock: 2,
      category: "Audio"
    });

    const respuesta = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toMatchObject({
      totalProducts: 2,
      totalUnits: 6,
      stockValue: 700,
      stockCost: 420,
      lowStockCount: 1,
      outOfStockCount: 0,
      categoriesCount: 2
    });
  });

  test("incluye productos antiguos sin campo status", async () => {
    await Product.collection.insertOne({
      name: "Producto antiguo",
      sku: "ANALYTICS-OLD-001",
      category: "DJ",
      price: 100,
      cost: 50,
      quantity: 3,
      minStock: 1,
      supplier: "Proveedor Antiguo"
    });

    const respuesta = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.totalProducts).toBe(1);
    expect(respuesta.body.totalUnits).toBe(3);
    expect(respuesta.body.stockValue).toBe(300);
  });

  test("excluye productos inactivos", async () => {
    await crearProducto({
      sku: "ANALYTICS-INACTIVE",
      status: "inactive"
    });

    const respuesta = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.totalProducts).toBe(0);
  });
});

describe("Analytics: agrupaciones y rankings", () => {
  beforeEach(async () => {
    await crearProducto({
      sku: "ANALYTICS-DJ",
      name: "Mesa DJ",
      category: "DJ",
      supplier: "Proveedor A",
      quantity: 5,
      price: 100
    });

    await crearProducto({
      sku: "ANALYTICS-AUDIO",
      name: "Altavoz",
      category: "Audio",
      supplier: "Proveedor B",
      quantity: 2,
      price: 200
    });
  });

  test("agrupa los productos por categoría", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/by-category")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveLength(2);

    const categoriaDJ = respuesta.body.find((item) => item.name === "DJ");

    expect(categoriaDJ).toMatchObject({
      totalProducts: 1,
      totalUnits: 5,
      stockValue: 500
    });
  });

  test("agrupa los productos por proveedor", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/by-supplier")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveLength(2);

    const proveedorA = respuesta.body.find(
      (item) => item.name === "Proveedor A"
    );

    expect(proveedorA).toMatchObject({
      totalProducts: 1,
      totalUnits: 5,
      stockValue: 500
    });
  });

  test("devuelve los productos ordenados por valor y respeta limit", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/top-value?limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].name).toBe("Mesa DJ");
    expect(respuesta.body[0].stockValue).toBe(500);
  });

  test("calcula el ranking de proveedores", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/suppliers-ranking")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveLength(2);
    expect(respuesta.body[0]).toMatchObject({
      supplier: "Proveedor A",
      totalProducts: 1,
      totalUnits: 5,
      stockValue: 500
    });
  });
});

describe("Analytics: importaciones", () => {
  beforeEach(async () => {
    await ImportJob.create([
      {
        fileName: "completada.csv",
        user: global.usuarioAnalyticsId,
        status: "completed",
        totalRows: 10,
        insertedRows: 10,
        errorRows: 0
      },
      {
        fileName: "parcial.csv",
        user: global.usuarioAnalyticsId,
        status: "partial",
        totalRows: 10,
        insertedRows: 7,
        errorRows: 3
      },
      {
        fileName: "fallida.csv",
        user: global.usuarioAnalyticsId,
        status: "failed",
        totalRows: 5,
        insertedRows: 0,
        errorRows: 5
      }
    ]);
  });

  test("calcula las estadísticas de importaciones", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/imports")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toMatchObject({
      totalJobs: 3,
      completed: 1,
      partial: 1,
      failed: 1,
      totalRows: 25,
      insertedRows: 17,
      errorRows: 8,
      successRate: 68
    });
    expect(respuesta.body.lastImportAt).toBeTruthy();
  });

  test("devuelve la evolución de importaciones", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/imports/timeline?days=30")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0]).toMatchObject({
      totalJobs: 3,
      completed: 1,
      partial: 1,
      failed: 1,
      totalRows: 25,
      errorRows: 8
    });
  });
});

describe("Analytics: autenticación y validaciones", () => {
  test("rechaza el acceso al resumen sin token", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/summary");

    expect(respuesta.statusCode).toBe(401);
  });

  test("rechaza un límite inválido en top-value", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/top-value?limit=100")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(400);
  });

  test("rechaza un número de días inválido en imports timeline", async () => {
    const respuesta = await request(app)
      .get("/api/analytics/imports/timeline?days=500")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(400);
  });
});