import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#07170e] text-slate-400 border-t border-emerald-950/80 py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Brand & Purpose */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-display text-white tracking-tight">
                FarmEasy
              </span>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800/40">
                PRO Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Direct Farmer-to-Consumer Agricultural Operating Network
            </p>
          </div>
        </div>

        {/* Value Tag */}
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-300/80">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Fair Farmer Pricing</span>
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1 text-amber-300/80">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Purity Verified</span>
          </span>
        </div>

        {/* Rights */}
        <div className="text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} FarmEasy Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
