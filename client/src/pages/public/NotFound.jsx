import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
          The requested project resource or academic view does not exist, or has been moved to a different milestone archive.
        </p>
        <Link to="/">
          <Button icon={Home}>Return to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};
