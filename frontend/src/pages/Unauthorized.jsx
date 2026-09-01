import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">403 - Access Denied</h1>
          <p className="mt-2 text-xs text-slate-500">
            You do not have the required permissions or role to access this area of FarmEasy.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 py-3 px-6 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
