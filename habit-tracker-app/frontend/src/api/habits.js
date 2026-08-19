const BASE_URL = "/api/habits";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
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

export function listHabits() {
  return request("");
}

export function createHabit(data) {
  return request("", { method: "POST", body: JSON.stringify(data) });
}

export function updateHabit(id, data) {
  return request(`/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteHabit(id) {
  return request(`/${id}`, { method: "DELETE" });
}

export function checkin(id) {
  return request(`/${id}/checkin`, { method: "POST" });
}

export function deleteCheckin(id) {
  return request(`/${id}/checkin`, { method: "DELETE" });
}

export function getLogs(id) {
  return request(`/${id}/logs`);
}
