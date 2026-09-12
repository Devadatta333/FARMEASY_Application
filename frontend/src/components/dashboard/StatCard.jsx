import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../ui/AnimatedCounter';
import MiniChart from '../ui/MiniChart';

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'emerald',
  trend = 'up',
  chartData,
}) {
  const getColorClasses = () => {
    switch (color) {
      case 'amber':
        return {
          bgIcon: 'bg-amber-50 text-amber-700 border border-amber-200/60',
          chartColor: '#f59e0b',
        };
      case 'blue':
        return {
          bgIcon: 'bg-sky-50 text-sky-700 border border-sky-200/60',
          chartColor: '#0284c7',
        };
      case 'purple':
        return {
          bgIcon: 'bg-purple-50 text-purple-700 border border-purple-200/60',
          chartColor: '#9333ea',
        };
      case 'rose':
        return {
          bgIcon: 'bg-rose-50 text-rose-700 border border-rose-200/60',
          chartColor: '#e11d48',
        };
      default:
        return {
          bgIcon: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
          chartColor: '#10b981',
        };
    }
  };

  const theme = getColorClasses();

  // Check if value is like "₹12,400" or "42" or string
  let prefix = '';
  let numericVal = null;
  let suffix = '';

  if (typeof value === 'number') {
    numericVal = value;
  } else if (typeof value === 'string') {
    if (value.startsWith('₹')) {
      prefix = '₹';
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) numericVal = parsed;
    } else {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && !/[a-zA-Z]{2,}/.test(value)) {
        numericVal = parsed;
      }
    }
  }

  // Default sparkline if none provided
  const sparklineData =
    chartData || (trend === 'down' ? [28, 26, 24, 25, 22, 20, 18] : [14, 18, 16, 22, 24, 28, 32]);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-elevated transition-all duration-200 flex flex-col justify-between group"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            {numericVal !== null ? (
              <AnimatedCounter value={numericVal} prefix={prefix} suffix={suffix} />
            ) : (
              <span>{value}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.bgIcon} transition-transform group-hover:scale-105`}
          >
            <Icon className="w-5 h-5 stroke-[1.8]" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
        {change ? (
          <div className="flex items-center space-x-1.5 text-xs">
            <span
              className={`font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                trend === 'down'
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              {trend === 'down' ? '↓' : '↑'} {change}
            </span>
            <span className="text-slate-400 text-[11px]">vs last month</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">Live updated</div>
        )}

        <MiniChart
          data={sparklineData}
          width={80}
          height={26}
          color={theme.chartColor}
          fillOpacity={0.12}
        />
      </div>
    </motion.div>
  );
}
