const BASE_URL = "/api/habits";

// La dependencia (quién hace el pedido HTTP) entra desde afuera.
// En la app real es fetch; en los tests, un doble hecho con vi.fn().
export function createHabitsApi(traer = (...args) => fetch(...args)) {
  async function request(path, options = {}) {
    const response = await traer(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || `Request failed with ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  return {
    listHabits: () => request(""),
    createHabit: (data) => request("", { method: "POST", body: JSON.stringify(data) }),
    updateHabit: (id, data) =>
      request(`/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteHabit: (id) => request(`/${id}`, { method: "DELETE" }),
    checkin: (id) => request(`/${id}/checkin`, { method: "POST" }),
    deleteCheckin: (id) => request(`/${id}/checkin`, { method: "DELETE" }),
    getLogs: (id) => request(`/${id}/logs`),
  };
}

// El cliente real, el que usan las pantallas: le pasa el fetch de verdad.
export const {
  listHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkin,
  deleteCheckin,
  getLogs,
} = createHabitsApi();