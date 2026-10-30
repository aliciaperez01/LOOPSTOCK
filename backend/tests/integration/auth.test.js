const request = require("supertest");
const { iniciar, limpiarBD, finalizar } = require("../helpers/db");

let app;
let User;

beforeAll(async () => {
  app = await iniciar();
  User = require("../../src/models/User");
}, 300000); // 5 min: la primera vez descarga el binario de Mongo

afterEach(limpiarBD);

afterAll(finalizar, 30000);

describe("POST /api/auth/login", () => {
  test("sin body → 400 (antes daba 500)", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  test("email con formato no válido → 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "no-es-un-email", password: "123456" });
    expect(res.status).toBe(400);
  });

  test("usuario inexistente → 401 (mismo mensaje que contraseña incorrecta)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nadie@loopstock.com", password: "123456" });
    expect(res.status).toBe(401);
  });

  test("contraseña incorrecta → 401", async () => {
    await User.create({
      name: "Admin Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin"
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "otra-contraseña" });
    expect(res.status).toBe(401);
  });

  test("usuario desactivado → 403", async () => {
    await User.create({
      name: "Baja Test",
      email: "baja@test.com",
      password: "password123",
      role: "empleado",
      active: false
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "baja@test.com", password: "password123" });
    expect(res.status).toBe(403);
  });

  test("credenciales correctas → 200 con token y sin la contraseña", async () => {
    await User.create({
      name: "Admin Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin"
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("admin@test.com");
    expect(res.body.user.password).toBeUndefined();
  });
});

describe("GET /api/auth/me", () => {
  test("sin token → 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("con token inválido → 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token-que-no-existe");
    expect(res.status).toBe(401);
  });

  test("con token válido → 200 con los datos del usuario", async () => {
    await User.create({
      name: "Admin Test",
      email: "admin@test.com",
      password: "password123",
      role: "admin"
    });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("admin@test.com");
  });
});
