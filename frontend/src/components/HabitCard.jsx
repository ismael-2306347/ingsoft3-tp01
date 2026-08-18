import { Link } from "react-router-dom";

import StreakBadge from "./StreakBadge";

export default function HabitCard({ habit, onCheckin, onUncheckin, onDelete }) {
  return (
    <div className="habit-card">
      <div>
        <Link to={`/habits/${habit.id}`} className="habit-card__name">
          {habit.name}
        </Link>
        {habit.description && (
          <p className="habit-card__description">{habit.description}</p>
        )}
        <StreakBadge current={habit.current_streak} best={habit.best_streak} />
      </div>
      <div className="habit-card__actions">
        <button
          className={habit.checked_in_today ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() =>
            habit.checked_in_today ? onUncheckin(habit.id) : onCheckin(habit.id)
          }
        >
          {habit.checked_in_today ? "Deshacer hoy" : "Marcar hoy"}
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(habit.id)}>
          Borrar
        </button>
      </div>
    </div>
  );
}
