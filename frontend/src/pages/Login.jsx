import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearMessages } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    dispatch(clearMessages());
    dispatch(loginUser(data))
      .unwrap()
      .then((res) => {
        toast.success(res.message || 'Welcome back to FarmEasy!');
        navigate('/dashboard');
      })
      .catch((err) => {
        toast.error(err || 'Login failed. Please check your credentials.');
      });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex w-full bg-[#fbfcf8]">
      {/* Split Layout Container */}
      <div className="w-full grid lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        {/* Left Panel: Agricultural Intelligence Showcase (hidden on small/medium) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-gradient-to-br from-[#072414] via-[#0b331d] to-[#04150b] text-white p-12 flex-col justify-between overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-forest-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Drifting Clouds Background */}
          <div className="absolute top-12 left-0 right-0 h-24 opacity-25 pointer-events-none overflow-hidden">
            <div className="w-[200%] h-full flex animate-cloud-drift">
              <svg className="w-1/2 h-full text-white/30 fill-current" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path d="M0,60 Q70,20 140,50 T280,40 T420,60 T500,40 L500,100 L0,100 Z" />
              </svg>
              <svg className="w-1/2 h-full text-white/20 fill-current" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path d="M0,50 Q60,10 120,40 T260,30 T400,50 T500,30 L500,100 L0,100 Z" />
              </svg>
            </div>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                  FarmEasy
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-300/80 bg-emerald-900/60 border border-emerald-600/40 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center Stage: Value Proposition & Animated Hero Graphics */}
          <div className="relative z-10 max-w-xl my-auto py-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Direct Farm-to-Consumer Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl xl:text-5xl font-extrabold font-display leading-[1.15] text-white"
            >
              Smarter farming, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-amber-200">
                fairer markets, direct value.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-base text-emerald-100/75 leading-relaxed"
            >
              Eliminate middlemen, forecast crop yields, and sell your produce at transparent, verified market prices with real-time agronomic insights.
            </motion.p>

            {/* Live Metrics Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 grid grid-cols-2 gap-4"
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Fair Pricing</span>
                </div>
                <div className="text-2xl font-bold font-display text-white">0%</div>
                <div className="text-xs text-emerald-200/60 mt-0.5">Middlemen commissions</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Network</span>
                </div>
                <div className="text-2xl font-bold font-display text-white">10,000+</div>
                <div className="text-xs text-emerald-200/60 mt-0.5">Active farmers & buyers</div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Horizon Illustration */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Marketplace Active • 2026 Harvest Season</span>
            </div>
            <span>ISO Certified Agricultural Portal</span>
          </div>

          {/* SVG Rolling Hills Bottom Silhouette */}
          <div className="absolute -bottom-1 left-0 right-0 pointer-events-none opacity-40">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 text-[#030d07] fill-current">
              <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z" />
            </svg>
          </div>
        </div>

        {/* Right Panel: Clean Authentication Form */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 bg-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto space-y-6"
          >
            {/* Mobile Brand (visible when left panel hidden) */}
            <div className="lg:hidden flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">FarmEasy</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to manage your farm or browse fresh direct produce.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
              >
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Google Authentication */}
            <div className="space-y-4">
              <GoogleAuthButton text="signin_with" />

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink-0 px-3 text-xs uppercase font-medium text-slate-400 bg-white">
                  or continue with credentials
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Login (Email or Username) */}
              <Input
                label="Email or Username"
                placeholder="name@example.com or farm_id"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.login?.message}
                {...register('login', {
                  required: 'Please enter your email or username',
                })}
              />

              {/* Password */}
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
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

                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to FarmEasy
                </Button>
              </div>
            </form>

            {/* Sign up prompt */}
            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                New to FarmEasy?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  Create an account
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
