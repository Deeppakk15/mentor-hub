import React from 'react';
import { Button } from './Button';
import { FolderKanban } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderKanban,
  title = 'No items found',
  description = 'There are no records available for this section yet.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
