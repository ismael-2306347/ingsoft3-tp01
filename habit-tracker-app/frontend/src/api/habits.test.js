import { describe, expect, it, vi } from "vitest";

import { createHabitsApi } from "./habits";

function respuesta({ ok = true, status = 200, body = {} } = {}) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

describe("createHabitsApi", () => {
  it("devuelve la lista que contesta la API", async () => {
    // Arrange: el doble actúa como STUB (sólo contesta)
    const traer = vi.fn().mockResolvedValue(respuesta({ body: [{ id: 1, name: "Leer" }] }));
    const api = createHabitsApi(traer);

    // Act
    const habitos = await api.listHabits();

    // Assert
    expect(habitos).toEqual([{ id: 1, name: "Leer" }]);
  });

  it("marcar un hábito pide POST a la ruta de checkin de ese hábito", async () => {
    // Arrange: el doble actúa como MOCK (verificamos cómo lo usaron)
    const traer = vi.fn().mockResolvedValue(respuesta());
    const api = createHabitsApi(traer);

    // Act
    await api.checkin(7);

    // Assert
    expect(traer).toHaveBeenCalledTimes(1);
    expect(traer).toHaveBeenCalledWith(
      "/api/habits/7/checkin",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("borrar devuelve null cuando la API contesta 204", async () => {
    const traer = vi.fn().mockResolvedValue(respuesta({ status: 204 }));

    expect(await createHabitsApi(traer).deleteHabit(3)).toBeNull();
  });

  it("lanza un error con el detalle que manda la API cuando falla", async () => {
    const traer = vi.fn().mockResolvedValue(
      respuesta({ ok: false, status: 404, body: { detail: "Habit not found" } }),
    );

    await expect(createHabitsApi(traer).getLogs(999)).rejects.toThrow("Habit not found");
  });

  it("si la API falla sin detalle, el error dice el código de estado", async () => {
    const traer = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("no es JSON")),
    });

    await expect(createHabitsApi(traer).listHabits()).rejects.toThrow("500");
  });
});