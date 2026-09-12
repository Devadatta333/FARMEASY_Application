import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

export default function Unauthorized() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-[#fbfcf8]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-elevated border border-slate-100">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-subtle">
          <ShieldAlert className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Error 403 • Restricted
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-3 tracking-tight">
            Access Restricted
          </h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Your current account role does not have the administrative or operational privileges required to view this sector.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/dashboard">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to My Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
