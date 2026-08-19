import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import * as habitsApi from "../api/habits";

export default function HabitDetailPage() {
  const { id } = useParams();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const habits = await habitsApi.listHabits();
      setHabit(habits.find((h) => String(h.id) === id) ?? null);
      setLogs(await habitsApi.getLogs(id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!habit) return <p>Cargando...</p>;

  return (
    <div className="app-container">
      <Link to="/">&larr; Volver</Link>
      <h1>{habit.name}</h1>
      {habit.description && <p>{habit.description}</p>}
      <p>
        Racha actual: <strong>{habit.current_streak} días</strong> — Mejor racha:{" "}
        <strong>{habit.best_streak} días</strong>
      </p>
      <h2>Historial</h2>
      <ul className="log-list">
        {logs.map((log) => (
          <li key={log.date}>{log.date}</li>
        ))}
        {logs.length === 0 && <li>Sin check-ins todavía.</li>}
      </ul>
    </div>
  );
}
