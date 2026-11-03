const request = require("supertest");

const {
  iniciar,
  limpiarBD,
  finalizar
} = require("../helpers/db");

let app;
let token;
let Product;
let User;
let Supplier;

// Crear un producto directamente en la base de datos
async function crearProducto(datos = {}) {
  return Product.create({
    name: "Mesa de mezclas",
    sku: "TEST-MIX-001",
    category: "DJ",
    price: 500,
    cost: 300,
    quantity: 5,
    minStock: 2,
    ...datos
  });
}

// Preparar la aplicación y los modelos
beforeAll(async () => {
  app = await iniciar();

  Product = require("../../src/models/Product");
  User = require("../../src/models/User");
  Supplier = require("../../src/models/Supplier");
});

// Crear administrador e iniciar sesión antes de cada prueba
beforeEach(async () => {
  await User.create({
    name: "Administrador Test",
    email: "admin.products@test.com",
    password: "Password123",
    role: "admin"
  });

  const respuestaLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin.products@test.com",
      password: "Password123"
    });

  expect(respuestaLogin.statusCode).toBe(200);
  token = respuestaLogin.body.token;
});

// Limpiar la base de datos después de cada prueba
afterEach(async () => {
  await limpiarBD();
});

// Cerrar la conexión al finalizar
afterAll(async () => {
  await finalizar();
});

// ==========================================
// T11 - BAJA LÓGICA DE PRODUCTOS
// ==========================================

describe("Baja lógica de productos (T11)", () => {

  test("DELETE cambia el estado a inactive sin borrar el producto", async () => {
    const producto = await crearProducto();

    const respuesta = await request(app)
      .delete(`/api/products/${producto._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.producto.status).toBe("inactive");

    const productoBD = await Product.findById(producto._id);

    expect(productoBD).not.toBeNull();
    expect(productoBD.status).toBe("inactive");
  });

  test("el listado normal no muestra productos inactivos", async () => {
    const producto = await crearProducto();

    await Product.findByIdAndUpdate(producto._id, {
      status: "inactive"
    });

    const respuesta = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);

    const productos = respuesta.body.items || respuesta.body;

    expect(
      productos.some(
        (item) => item._id === producto._id.toString()
      )
    ).toBe(false);
  });

  test("el filtro status=inactive muestra productos inactivos", async () => {
    const producto = await crearProducto();

    await Product.findByIdAndUpdate(producto._id, {
      status: "inactive"
    });

    const respuesta = await request(app)
      .get("/api/products?status=inactive")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);

    const productos = respuesta.body.items || respuesta.body;

    expect(
      productos.some(
        (item) => item._id === producto._id.toString()
      )
    ).toBe(true);
  });

  test("DELETE devuelve 404 si el producto no existe", async () => {
    const idInexistente = "000000000000000000000000";

    const respuesta = await request(app)
      .delete(`/api/products/${idInexistente}`)
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(404);
  });

});

// ==========================================
// T22b - VALIDACIONES DE PRODUCTOS
// ==========================================

describe("Validaciones de productos (T22b)", () => {

  let supplierRef;

  beforeEach(async () => {
    const proveedor = await Supplier.create({
      name: "Proveedor Test"
    });

    supplierRef = proveedor._id.toString();
  });

  test("POST devuelve 409 si el SKU ya existe", async () => {
    await crearProducto();

    const respuesta = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Otra mesa de mezclas",
        sku: "TEST-MIX-001",
        category: "DJ",
        price: 600,
        cost: 350,
        quantity: 5,
        minStock: 2,
        supplierRef
      });

    expect(respuesta.statusCode).toBe(409);
    expect(respuesta.body.campo).toBe("sku");
  });

  test("POST devuelve 400 si la cantidad es cero", async () => {
    const respuesta = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Mesa de mezclas",
        sku: "TEST-MIX-002",
        category: "DJ",
        price: 500,
        cost: 300,
        quantity: 0,
        minStock: 2,
        supplierRef
      });

    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.body.error).toContain("al menos 1 unidad");
  });

});
