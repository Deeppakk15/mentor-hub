import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">403 - Access Restricted</h1>
        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
          Your current account role does not have authorization to view this institutional resource.
        </p>
        <Link to={`/${user?.role || 'student'}/dashboard`}>
          <Button icon={ArrowLeft}>Return to My Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
