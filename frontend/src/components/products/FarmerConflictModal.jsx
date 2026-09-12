import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShoppingCart, RefreshCw, X } from 'lucide-react';

const FarmerConflictModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentFarmerName = 'Another Farmer',
  newFarmerName = 'New Farmer',
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Single Farmer Order Policy
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                Replace items in cart?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Your cart currently contains produce from <strong className="text-slate-900 font-bold">{currentFarmerName}</strong>.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                To keep farm delivery direct & fresh, each order is placed with a single farmer. Would you like to clear your cart and start a new order with <strong className="text-emerald-700 font-bold">{newFarmerName}</strong>?
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Keep Existing Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Replace & Add</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FarmerConflictModal;
