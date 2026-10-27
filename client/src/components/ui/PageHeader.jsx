import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  actions,
  backUrl,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && (
        <nav className="flex items-center text-xs text-slate-500 mb-2 space-x-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.link ? (
                <span
                  onClick={() => navigate(crumb.link)}
                  className="hover:text-slate-800 cursor-pointer transition-colors"
                >
                  {crumb.label}
                </span>
              ) : (
                <span className="text-slate-800 font-medium">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span className="text-slate-300">/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {backUrl && (
            <button
              onClick={() => navigate(backUrl)}
              className="mt-1 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
