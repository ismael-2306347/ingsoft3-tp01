import { formatDays } from "../lib/habits";

export default function StreakBadge({ current, best }) {
  return (
    <div className="streak-badge">
      <span>🔥 {formatDays(current)}</span>
      <span>Mejor: {best}</span>
    </div>
  );
}