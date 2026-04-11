import React from 'react';

const STATUS_COLORS = {
  confirmed: 'bg-info/10 text-info',
  preparing: 'bg-warning/10 text-warning',
  ready: 'bg-success/10 text-success',
  completed: 'bg-text-secondary/10 text-text-secondary',
  cancelled: 'bg-error/10 text-error',
  pending: 'border border-error text-error bg-transparent',
  active: 'bg-success/10 text-success',
  inactive: 'bg-error/10 text-error',
  occupied: 'bg-warning/10 text-warning',
  free: 'bg-success/10 text-success',
};

const StatusBadge = ({ status, className = '' }) => {
  const normStatus = (status || '').toLowerCase();
  const colorClass = STATUS_COLORS[normStatus] || 'bg-text-muted/10 text-text-muted';

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${colorClass} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
