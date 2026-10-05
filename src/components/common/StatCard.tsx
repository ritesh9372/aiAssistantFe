interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default StatCard;
