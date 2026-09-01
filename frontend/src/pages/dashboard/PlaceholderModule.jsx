import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Sparkles, ArrowLeft, Clock } from 'lucide-react';

const PlaceholderModule = () => {
  const location = useLocation();

  // Format module title from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const rawName = pathParts[pathParts.length - 1] || 'Module';
  const formattedTitle = rawName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <DashboardLayout title={formattedTitle}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-md">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-300 mb-2">
          Future Module Placeholder
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {formattedTitle} Module
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
          This feature will be fully built and plugged in during upcoming project development phases (Product Management, Orders, Payments, AI Chatbot & Admin Control).
        </p>

        <div className="mt-6 flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Dashboard</span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlaceholderModule;
