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