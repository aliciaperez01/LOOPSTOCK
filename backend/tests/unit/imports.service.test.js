// Pruebas unitarias de la parte del CSV que no toca la base de datos.
// No necesitan Mongo: por eso están separadas de tests/integration/.
const {
  leerCsv,
  validarColumnas,
  calcularEstado,
  procesarFilas
} = require("../../src/services/imports.service");

describe("leerCsv", () => {
  test("lee un CSV separado por comas", () => {
    const filas = leerCsv(Buffer.from("sku,name\nABC,Mesa\n"));
    expect(filas).toEqual([{ sku: "ABC", name: "Mesa" }]);
  });

  test("detecta el separador ; del CSV de Excel en español", () => {
    const filas = leerCsv(Buffer.from("sku;name\nABC;Mesa\n"));
    expect(filas).toEqual([{ sku: "ABC", name: "Mesa" }]);
  });

  test("CSV con formato roto → AppError 400", () => {
    expect(() => leerCsv(Buffer.from('sku,name\n"ABC,Mesa\n'))).toThrow();
    try {
      leerCsv(Buffer.from('sku,name\n"ABC,Mesa\n'));
    } catch (error) {
      expect(error.statusCode).toBe(400);
    }
  });
});

describe("validarColumnas", () => {
  test("sin filas → AppError 400", () => {
    expect(() => validarColumnas([])).toThrow();
  });

  test("faltan columnas obligatorias → AppError 400 con el nombre de la columna", () => {
    try {
      validarColumnas([{ sku: "ABC" }]);
      throw new Error("no debería llegar aquí");
    } catch (error) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/name/);
    }
  });

  test("con todas las columnas obligatorias, no lanza error", () => {
    expect(() =>
      validarColumnas([{ sku: "A", name: "B", category: "C", quantity: "1", price: "1" }])
    ).not.toThrow();
  });
});

describe("calcularEstado", () => {
  test("sin errores → completed", () => {
    expect(calcularEstado(5, 0)).toBe("completed");
  });

  test("todo con error → failed", () => {
    expect(calcularEstado(0, 5)).toBe("failed");
  });

  test("mezcla de aciertos y errores → partial", () => {
    expect(calcularEstado(3, 2)).toBe("partial");
  });
});

describe("procesarFilas", () => {
  const sinExtras = { skusExistentes: new Set(), proveedoresActivos: new Map() };

  test("fila válida se acepta", async () => {
    const filas = [{ sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "3", price: "10" }];
    const { validos, errores } = await procesarFilas(filas, sinExtras);
    expect(errores).toHaveLength(0);
    expect(validos).toHaveLength(1);
    expect(validos[0].sku).toBe("ABC1");
  });

  test("SKU ya existente en la base de datos → error de fila", async () => {
    const filas = [{ sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "3", price: "10" }];
    const { validos, errores } = await procesarFilas(filas, {
      ...sinExtras,
      skusExistentes: new Set(["ABC1"])
    });
    expect(validos).toHaveLength(0);
    expect(errores).toHaveLength(1);
    expect(errores[0].message).toMatch(/Ya existe/);
  });

  test("SKU repetido dentro del propio archivo → error solo en la segunda fila", async () => {
    const filas = [
      { sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "3", price: "10" },
      { sku: "ABC1", name: "Otra mesa", category: "Mezcladoras", quantity: "1", price: "5" }
    ];
    const { validos, errores } = await procesarFilas(filas, sinExtras);
    expect(validos).toHaveLength(1);
    expect(errores).toHaveLength(1);
    expect(errores[0].row).toBe(3);
  });

  test("cantidad 0 → error (un producto nuevo necesita al menos 1 unidad)", async () => {
    const filas = [{ sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "0", price: "10" }];
    const { validos, errores } = await procesarFilas(filas, sinExtras);
    expect(validos).toHaveLength(0);
    expect(errores[0].message).toMatch(/al menos 1 unidad/);
  });

  test("precio no numérico → error", async () => {
    const filas = [{ sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "3", price: "diez" }];
    const { errores } = await procesarFilas(filas, sinExtras);
    expect(errores[0].message).toMatch(/"price" debe ser un número/);
  });

  test("proveedor indicado pero inexistente/inactivo → error", async () => {
    const filas = [
      { sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "3", price: "10", supplier: "Fantasma SA" }
    ];
    const { errores } = await procesarFilas(filas, sinExtras);
    expect(errores[0].message).toMatch(/no existe o está inactivo/);
  });

  test("proveedor existente y activo → se normaliza al nombre guardado", async () => {
    const filas = [
      { sku: "abc1", name: "Mesa", category: "Mezcladoras", quantity: "3", price: "10", supplier: "pioneer dj" }
    ];
    const { validos } = await procesarFilas(filas, {
      ...sinExtras,
      proveedoresActivos: new Map([["pioneer dj", "Pioneer DJ"]])
    });
    expect(validos[0].producto.supplier).toBe("Pioneer DJ");
  });
});
