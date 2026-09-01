import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, color = 'emerald', trend = 'up' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'amber':
        return {
          bgIcon: 'bg-amber-100 text-amber-700',
          border: 'hover:border-amber-300',
          glow: 'shadow-amber-500/10',
        };
      case 'blue':
        return {
          bgIcon: 'bg-blue-100 text-blue-700',
          border: 'hover:border-blue-300',
          glow: 'shadow-blue-500/10',
        };
      case 'purple':
        return {
          bgIcon: 'bg-purple-100 text-purple-700',
          border: 'hover:border-purple-300',
          glow: 'shadow-purple-500/10',
        };
      case 'teal':
        return {
          bgIcon: 'bg-teal-100 text-teal-700',
          border: 'hover:border-teal-300',
          glow: 'shadow-teal-500/10',
        };
      default:
        return {
          bgIcon: 'bg-emerald-100 text-emerald-700',
          border: 'hover:border-emerald-300',
          glow: 'shadow-emerald-500/10',
        };
    }
  };

  const theme = getColorClasses();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-md ${theme.glow} ${theme.border} transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${theme.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
        {change && (
          <div className="mt-2 flex items-center space-x-1 text-xs">
            <span
              className={`font-bold ${
                trend === 'down' ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'
              }`}
            >
              {trend === 'down' ? '↓' : '↑'} {change}
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
