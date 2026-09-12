import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { requestForgotPassword, clearMessages } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Sprout, Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [resetSent, setResetSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    dispatch(clearMessages());
    dispatch(requestForgotPassword(data))
      .unwrap()
      .then((res) => {
        toast.success(res.message || 'Reset link generated successfully');
        setResetSent(true);
        if (res.resetToken) {
          setDevToken(res.resetToken);
        }
      })
      .catch((err) => {
        toast.error(err || 'Failed to request password reset');
      });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#fbfcf8]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-elevated border border-slate-100 p-8 sm:p-10 space-y-6"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center mb-3 shadow-subtle">
            <KeyRound className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Forgot password?
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter your FarmEasy account email. We'll send you instructions to safely recover your credentials.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {resetSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-left flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Password reset instructions sent</p>
                <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                  Check your inbox for the recovery link (valid for 10 minutes).
                </p>
              </div>
            </div>

            {/* Development helper link */}
            {devToken && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                <p className="text-xs font-bold text-amber-900">⚡ Local Testing Mode Link</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Since local test email server is mock, click here to test reset directly:
                </p>
                <Link
                  to={`/reset-password/${devToken}`}
                  className="mt-2 inline-block text-xs font-bold text-emerald-800 underline break-all hover:text-emerald-950"
                >
                  Click Here to Complete Reset
                </Link>
              </div>
            )}

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => (window.location.href = '/login')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Sign In
            </Button>
          </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Account Email"
              type="email"
              placeholder="farmer@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Please enter your email',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Recovery Instructions
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
