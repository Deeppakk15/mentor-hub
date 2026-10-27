import React from 'react';

export const Badge = ({ children, status = 'default', size = 'sm', className = '' }) => {
  const normalized = String(status || '').toLowerCase().replace(/[\s-]/g, '_');

  const statusStyles = {
    // Project lifecycle statuses
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    changes_requested: 'bg-orange-50 text-orange-700 border-orange-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',

    // Task & Priority statuses
    todo: 'bg-slate-100 text-slate-700 border-slate-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-purple-50 text-purple-700 border-purple-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-blue-50 text-blue-600 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    urgent: 'bg-rose-50 text-rose-700 border-rose-200',

    // Generic
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const style = statusStyles[normalized] || statusStyles.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${sizes[size] || sizes.sm} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 shrink-0" />
      {children || status.replace('_', ' ').toUpperCase()}
    </span>
  );
};
