import { describe, expect, it } from "vitest";

import { streakMessage } from "./habits";

describe("streakMessage", () => {
  it("devuelve texto vacío si no hay hábito", () => {
    expect(streakMessage(null)).toBe("");
  });

  it("invita a empezar si nunca hubo racha", () => {
    const habit = { current_streak: 0, best_streak: 0, checked_in_today: false };

    expect(streakMessage(habit)).toBe("Empezá hoy tu primera racha.");
  });

  it("recuerda la mejor racha si la actual se cortó", () => {
    const habit = { current_streak: 0, best_streak: 5, checked_in_today: false };

    expect(streakMessage(habit)).toBe("Tu mejor racha fue de 5 días. ¡Volvé a empezar!");
  });

  it("avisa que hay que marcar hoy si la racha sigue viva desde ayer", () => {
    const habit = { current_streak: 3, best_streak: 3, checked_in_today: false };

    expect(streakMessage(habit)).toBe("Marcá hoy para no perder la racha.");
  });

  it("felicita cuando la racha actual es la mejor", () => {
    const habit = { current_streak: 4, best_streak: 4, checked_in_today: true };

    expect(streakMessage(habit)).toBe("¡Estás en tu mejor racha!");
  });

  it("avisa cuando falta un solo día para empatar el récord", () => {
    const habit = { current_streak: 4, best_streak: 5, checked_in_today: true };

    expect(streakMessage(habit)).toBe("¡Un día más y empatás tu récord!");
  });

  it("dice cuántos días faltan para el récord en el resto de los casos", () => {
    const habit = { current_streak: 2, best_streak: 6, checked_in_today: true };

    expect(streakMessage(habit)).toBe("Vas 2 días. Te faltan 4 para tu récord.");
  });
});