import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    id,
    placeholder = ' ',
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full text-left ${containerClassName}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-sans"
          >
            {label}
            {required && <span className="text-emerald-600 ml-0.5">*</span>}
          </label>
        </div>
      )}

      <div
        className={`relative flex items-center transition-all duration-200 rounded-xl bg-white border ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : isFocused
            ? 'border-emerald-500 ring-3 ring-emerald-500/10 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 shadow-subtle'
        }`}
      >
        {leftIcon && (
          <div className="pl-3.5 pr-1 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
            leftIcon ? 'pl-2' : ''
          } ${rightIcon ? 'pr-2' : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="pr-3 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </motion.p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

export default Input;
