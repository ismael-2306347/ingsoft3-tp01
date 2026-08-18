import { useEffect, useState } from "react";

import * as habitsApi from "../api/habits";
import HabitCard from "../components/HabitCard";
import HabitFormModal from "../components/HabitFormModal";

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    setLoading(true);
    try {
      const data = await habitsApi.listHabits();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(values) {
    await habitsApi.createHabit(values);
    setShowForm(false);
    await loadHabits();
  }

  async function handleCheckin(id) {
    await habitsApi.checkin(id);
    await loadHabits();
  }

  async function handleUncheckin(id) {
    await habitsApi.deleteCheckin(id);
    await loadHabits();
  }

  async function handleDelete(id) {
    await habitsApi.deleteHabit(id);
    await loadHabits();
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Rachas</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo hábito
        </button>
      </header>

      {loading && <p>Cargando...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onCheckin={handleCheckin}
            onUncheckin={handleUncheckin}
            onDelete={handleDelete}
          />
        ))}
        {!loading && habits.length === 0 && <p>Todavía no creaste ningún hábito.</p>}
      </div>

      {showForm && (
        <HabitFormModal onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
