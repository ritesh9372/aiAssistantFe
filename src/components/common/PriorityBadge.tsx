interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <span className={`priority-badge priority-${priority}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>;
}

export default PriorityBadge;
