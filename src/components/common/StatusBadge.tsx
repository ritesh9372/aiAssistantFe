interface StatusBadgeProps {
  status: 'pending' | 'active' | 'resolved';
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default StatusBadge;
