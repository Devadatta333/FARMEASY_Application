import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CreditCard,
  Building2,
  Lock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  X,
  Smartphone,
} from 'lucide-react';

const PaymentSimulator = ({
  isOpen,
  paymentMethod = 'UPI',
  amount = 0,
  onSuccess,
  onCancel,
}) => {
  const [stage, setStage] = useState('input'); // 'input' | 'processing' | 'success'
  const [upiId, setUpiId] = useState('consumer@upi');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [selectedBank, setSelectedBank] = useState('SBI');

  useEffect(() => {
    if (isOpen) {
      setStage('input');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPayment = () => {
    setStage('processing');
    setTimeout(() => {
      setStage('success');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        ></motion.div>

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 my-8 overflow-hidden"
        >
          {stage === 'input' && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {stage === 'input' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Simulated Payment Gateway
                </h3>
                <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted • FarmEasy Express</span>
                </p>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payable Amount</span>
                  <p className="text-2xl font-black text-emerald-400">₹{amount}</p>
                </div>
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-emerald-200 border border-white/10">
                  {paymentMethod}
                </span>
              </div>

              {/* Method Specific UI */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                      <QrCode className="w-28 h-28 text-slate-800" />
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Scan QR with GPay / PhonePe / Paytm or enter VPA
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      UPI ID / VPA
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="username@upi"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-mono text-center font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-mono text-center font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                          selectedBank === bank
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>{bank}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Pay ₹{amount}</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  * Note: This is a secure test payment simulation. No real money will be charged.
                </p>
              </div>
            </div>
          )}

          {stage === 'processing' && (
            <div className="text-center py-10 space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping"></div>
                <div className="relative w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  Processing Payment...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting with bank servers via encrypted gateway. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-8 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Payment Verified!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Transaction Authorized • Finalizing Farm Order
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentSimulator;
