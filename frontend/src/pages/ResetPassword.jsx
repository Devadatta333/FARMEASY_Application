import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { executeResetPassword, clearMessages } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Sprout, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    dispatch(clearMessages());
    dispatch(executeResetPassword({ resetToken: token, password: data.password }))
      .unwrap()
      .then((res) => {
        toast.success(res.message || 'Password successfully updated!');
        navigate('/dashboard');
      })
      .catch((err) => {
        toast.error(err || 'Failed to reset password');
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
            <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Set new password
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Please choose a secure new password for your FarmEasy account.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === passwordVal || 'Passwords do not match',
            })}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password & Access Farm
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
