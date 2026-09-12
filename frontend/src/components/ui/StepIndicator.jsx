import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <nav aria-label="Progress" className="w-full py-2">
      <ol className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-slate-200 z-0" />

        {/* Animated active track line */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-emerald-600 z-0 origin-left"
          initial={{ width: '0%' }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step.title || idx} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={!onStepClick || stepNumber > currentStep}
                onClick={() => onStepClick?.(stepNumber)}
                className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold text-xs transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-white border-2 border-emerald-600 text-emerald-700 ring-4 ring-emerald-100/70 font-bold scale-110 shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-400'
                } ${onStepClick && stepNumber < currentStep ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </button>

              <div className="hidden sm:block absolute top-10 whitespace-nowrap text-center">
                <span
                  className={`text-xs font-medium tracking-tight ${
                    isCurrent
                      ? 'text-emerald-900 font-semibold'
                      : isComplete
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
