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

beforeAll(async () => {
  app = await iniciar();

  Product = require("../../src/models/Product");
  User = require("../../src/models/User");
});

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

afterEach(async () => {
  await limpiarBD();
});

afterAll(async () => {
  await finalizar();
});

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