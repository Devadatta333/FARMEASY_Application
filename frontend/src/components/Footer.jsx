import React from 'react';
import { Sprout, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">FarmEasy</span>
          <span className="text-slate-500">| Direct Farmer to Consumer Marketplace</span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          <span>Empowering Agriculture with AI & Fair Pricing</span>
        </div>

        <div className="text-slate-500">
          &copy; {new Date().getFullYear()} FarmEasy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
