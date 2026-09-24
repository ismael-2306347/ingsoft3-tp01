import { describe, expect, it } from "vitest";

import { formatDays, validateHabit } from "./habits";

describe("validateHabit", () => {
  it.each([
    ["vacío", ""],
    ["sólo espacios", "   "],
    ["un tabulador", "\t"],
    ["nulo", null],
  ])("rechaza un nombre %s", (_caso, name) => {
    const resultado = validateHabit({ name });

    expect(resultado.valid).toBe(false);
    expect(resultado.error).toBe("El nombre es obligatorio.");
  });

  it("rechaza un nombre que supera los 100 caracteres y dice el límite", () => {
    const resultado = validateHabit({ name: "a".repeat(101) });

    expect(resultado.valid).toBe(false);
    expect(resultado.error).toContain("100");
  });

  it("acepta un nombre de exactamente 100 caracteres", () => {
    expect(validateHabit({ name: "a".repeat(100) }).valid).toBe(true);
  });

  it("rechaza una descripción de más de 500 caracteres", () => {
    const resultado = validateHabit({ name: "Leer", description: "a".repeat(501) });

    expect(resultado.valid).toBe(false);
    expect(resultado.error).toContain("500");
  });

  it("recorta espacios del nombre y convierte la descripción vacía en null", () => {
    const resultado = validateHabit({ name: "  Leer  ", description: "" });

    expect(resultado.values).toEqual({ name: "Leer", description: null });
  });
});

describe("formatDays", () => {
  it.each([
    [0, "0 días"],
    [1, "1 día"],
    [5, "5 días"],
  ])("formatea %i como '%s'", (count, esperado) => {
    expect(formatDays(count)).toBe(esperado);
  });
});