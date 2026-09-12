import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-[#fbfcf8]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-elevated border border-slate-100">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shadow-subtle">
          <Compass className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 mt-3 tracking-tight">
            Off the Beaten Trail
          </h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            The field or page you are navigating towards does not exist or may have been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Marketplace Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
