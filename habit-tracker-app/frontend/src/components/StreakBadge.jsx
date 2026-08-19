export default function StreakBadge({ current, best }) {
  return (
    <div className="streak-badge">
      <span>🔥 {current} días</span>
      <span>Mejor: {best}</span>
    </div>
  );
}
