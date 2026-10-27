import React from 'react';

export const SkeletonLoader = ({ count = 3, type = 'card', className = '' }) => {
  if (type === 'table') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-10 bg-slate-200/70 rounded-lg w-full" />
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl border border-slate-200/60 p-4">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
            <div className="h-7 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-5 bg-white rounded-xl border border-slate-200/70 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};
