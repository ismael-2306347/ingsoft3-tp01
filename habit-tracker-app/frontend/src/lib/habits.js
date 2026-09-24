export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

// Las mismas reglas que valida el backend (app/schemas.py), para avisar
// antes de mandar el pedido.
export function validateHabit({ name, description } = {}) {
  const trimmedName = (name ?? "").trim();
  if (trimmedName === "") {
    return { valid: false, error: "El nombre es obligatorio." };
  }
  if (trimmedName.length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `El nombre no puede superar los ${NAME_MAX_LENGTH} caracteres.`,
    };
  }
  if (description && description.length > DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`,
    };
  }
  return {
    valid: true,
    error: null,
    values: { name: trimmedName, description: description || null },
  };
}

export function formatDays(count) {
  return count === 1 ? "1 día" : `${count} días`;
}

// Mensaje motivacional según el estado de la racha de un hábito.
export function streakMessage(habit) {
  if (!habit) {
    return "";
  }
  const current = habit.current_streak ?? 0;
  const best = habit.best_streak ?? 0;

  if (current === 0 && best === 0) {
    return "Empezá hoy tu primera racha.";
  }
  if (current === 0) {
    return `Tu mejor racha fue de ${formatDays(best)}. ¡Volvé a empezar!`;
  }
  if (!habit.checked_in_today) {
    return "Marcá hoy para no perder la racha.";
  }
  if (current >= best) {
    return "¡Estás en tu mejor racha!";
  }
  if (best - current === 1) {
    return "¡Un día más y empatás tu récord!";
  }
  return `Vas ${formatDays(current)}. Te faltan ${best - current} para tu récord.`;
}