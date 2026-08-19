import { useEffect, useState } from "react";

import * as habitsApi from "../api/habits";
import HabitCard from "../components/HabitCard";
import HabitFormModal from "../components/HabitFormModal";

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

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
    setError(null);
    try {
      await habitsApi.createHabit(values);
      setShowForm(false);
      await loadHabits();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(id, values) {
    setError(null);
    try {
      await habitsApi.updateHabit(id, values);
      setEditingHabit(null);
      await loadHabits();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCheckin(id) {
    setError(null);
    try {
      await habitsApi.checkin(id);
      await loadHabits();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUncheckin(id) {
    setError(null);
    try {
      await habitsApi.deleteCheckin(id);
      await loadHabits();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await habitsApi.deleteHabit(id);
      await loadHabits();
    } catch (err) {
      setError(err.message);
    }
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
            onEdit={setEditingHabit}
          />
        ))}
        {!loading && habits.length === 0 && <p>Todavía no creaste ningún hábito.</p>}
      </div>

      {(showForm || editingHabit) && (
        <HabitFormModal
          habit={editingHabit ?? undefined}
          onSubmit={
            editingHabit
              ? (values) => handleUpdate(editingHabit.id, values)
              : handleCreate
          }
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
}
