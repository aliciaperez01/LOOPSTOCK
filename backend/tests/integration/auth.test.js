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
describe("PATCH /api/auth/password", () => {
  async function crearUsuarioYObtenerToken() {
    await User.create({
      name: "Admin Test",
      email: "password@test.com",
      password: "password123",
      role: "admin"
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: "password@test.com",
        password: "password123"
      });
    return login.body.token;
  }
  test("sin token → 401", async () => {
    const res = await request(app)
      .patch("/api/auth/password")
      .send({
        currentPassword: "password123",
        newPassword: "nuevaPassword123"
      });
    expect(res.status).toBe(401);
  });
  test("contraseña actual incorrecta → 400", async () => {
    const token = await crearUsuarioYObtenerToken();

    const res = await request(app)
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "incorrecta123",
        newPassword: "nuevaPassword123"
      });
    expect(res.status).toBe(400);
  });
  test("nueva contraseña demasiado corta → 400", async () => {
    const token = await crearUsuarioYObtenerToken();
    const res = await request(app)
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "password123",
        newPassword: "123"
      });
    expect(res.status).toBe(400);
  });
  test("cambio correcto → 200 y permite iniciar sesión con la nueva contraseña", async () => {
    const token = await crearUsuarioYObtenerToken();

    const cambio = await request(app)
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "password123",
        newPassword: "nuevaPassword123"
      });

    expect(cambio.status).toBe(200);

    const loginAnterior = await request(app)
      .post("/api/auth/login")
      .send({
        email: "password@test.com",
        password: "password123"
      });
    expect(loginAnterior.status).toBe(401);

    const loginNuevo = await request(app)
      .post("/api/auth/login")
      .send({
        email: "password@test.com",
        password: "nuevaPassword123"
      });

    expect(loginNuevo.status).toBe(200);
  });
});
});