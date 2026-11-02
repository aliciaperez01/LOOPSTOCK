const request = require("supertest");
const { iniciar, limpiarBD, finalizar } = require("../helpers/db");

let app;
let User;

let admin;
let empleado;
let otroEmpleado;
let tokenAdmin;
let tokenEmpleado;
let tokenOtroEmpleado;

async function iniciarSesion(email, password = "password123") {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
}

beforeAll(async () => {
  app = await iniciar();
  User = require("../../src/models/User");
}, 300000);

beforeEach(async () => {
  admin = await User.create({
    name: "Admin Test",
    email: "admin@test.com",
    password: "password123",
    role: "admin"
  });

  empleado = await User.create({
    name: "Empleado Uno",
    email: "empleado@test.com",
    password: "password123",
    role: "empleado"
  });

  otroEmpleado = await User.create({
    name: "Empleado Dos",
    email: "otro@test.com",
    password: "password123",
    role: "empleado"
  });

  tokenAdmin = await iniciarSesion("admin@test.com");
  tokenEmpleado = await iniciarSesion("empleado@test.com");
  tokenOtroEmpleado = await iniciarSesion("otro@test.com");
});

afterEach(limpiarBD);
afterAll(finalizar, 30000);

describe("GET /api/shifts", () => {
  test("sin token → 401", async () => {
    const res = await request(app).get("/api/shifts");
    expect(res.status).toBe(401);
  });

  test("empleado solo consulta sus propios turnos", async () => {
    const turnoPropio = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    const turnoAjeno = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: otroEmpleado._id,
        date: "2026-11-11",
        startTime: "10:00",
        endTime: "18:00"
      });

    expect(turnoPropio.status).toBe(201);
    expect(turnoAjeno.status).toBe(201);

    const res = await request(app)
      .get("/api/shifts?year=2026&month=11")
      .set("Authorization", `Bearer ${tokenEmpleado}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].employee._id.toString()).toBe(empleado._id.toString());
  });

  test("administrador puede consultar todos los turnos", async () => {
    await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: otroEmpleado._id,
        date: "2026-11-11",
        startTime: "10:00",
        endTime: "18:00"
      });

    const res = await request(app)
      .get("/api/shifts?year=2026&month=11")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /api/shifts", () => {
  test("administrador puede crear un turno", async () => {
    const res = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00",
        notes: "Turno de mañana"
      });

    expect(res.status).toBe(201);
    expect(res.body.turno.date).toBe("2026-11-10");
    expect(res.body.turno.startTime).toBe("09:00");
  });

  test("empleado no puede crear turnos → 403", async () => {
    const res = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenEmpleado}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    expect(res.status).toBe(403);
  });

  test("rechaza una fecha inexistente → 400", async () => {
    const res = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-02-30",
        startTime: "09:00",
        endTime: "17:00"
      });

    expect(res.status).toBe(400);
  });

  test("rechaza una hora de fin anterior al inicio → 400", async () => {
    const res = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "17:00",
        endTime: "09:00"
      });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/shifts/:id", () => {
  test("administrador puede modificar un turno", async () => {
    const creado = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    const res = await request(app)
      .patch(`/api/shifts/${creado.body.turno._id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ startTime: "08:00" });

    expect(res.status).toBe(200);
    expect(res.body.turno.startTime).toBe("08:00");
  });

  test("empleado no puede modificar turnos → 403", async () => {
    const creado = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    const res = await request(app)
      .patch(`/api/shifts/${creado.body.turno._id}`)
      .set("Authorization", `Bearer ${tokenEmpleado}`)
      .send({ startTime: "08:00" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/shifts/:id", () => {
  test("administrador puede eliminar un turno", async () => {
    const creado = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    const res = await request(app)
      .delete(`/api/shifts/${creado.body.turno._id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
  });

  test("empleado no puede eliminar turnos → 403", async () => {
    const creado = await request(app)
      .post("/api/shifts")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        employee: empleado._id,
        date: "2026-11-10",
        startTime: "09:00",
        endTime: "17:00"
      });

    const res = await request(app)
      .delete(`/api/shifts/${creado.body.turno._id}`)
      .set("Authorization", `Bearer ${tokenEmpleado}`);

    expect(res.status).toBe(403);
  });
});