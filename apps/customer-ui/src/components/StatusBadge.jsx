import React from 'react';

const STATUS_CONFIG = {
  PENDING: 'bg-slate-100 text-slate-500 border-slate-200',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
  PREPARING: 'bg-orange-50 text-orange-600 border-orange-100',
  READY: 'bg-green-50 text-green-600 border-green-100',
  COMPLETED: 'bg-slate-50 text-slate-400 border-slate-100',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || 'bg-slate-50 text-slate-400 border-slate-100';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
