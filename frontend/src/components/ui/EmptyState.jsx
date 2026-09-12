import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center p-8 text-center bg-white/60 border border-dashed border-slate-200 rounded-2xl ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-700 mb-4 shadow-subtle">
        {Icon ? <Icon className="w-7 h-7 stroke-[1.75]" /> : <span>🌱</span>}
      </div>

      <h3 className="text-base font-semibold text-slate-800 font-display mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}
