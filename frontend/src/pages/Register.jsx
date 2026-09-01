import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearMessages } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Sprout, User, Mail, Lock, Eye, EyeOff, Tractor, ShoppingCart, ArrowRight, ShieldAlert } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import toast from 'react-hot-toast';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState('consumer');
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
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    dispatch(clearMessages());
    const payload = {
      ...data,
      role: selectedRole,
    };

    dispatch(registerUser(payload))
      .unwrap()
      .then((res) => {
        toast.success(res.message || 'Registration successful!');
        navigate('/dashboard');
      })
      .catch((err) => {
        toast.error(err || 'Registration failed');
      });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full space-y-7 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mb-3 transform hover:rotate-6 transition-transform">
            <Sprout className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Join <span className="text-emerald-600">FarmEasy</span> Today
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose your account role to get started on the direct agriculture network
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start space-x-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
            Select Your FarmEasy Role
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            {/* Consumer Choice */}
            <button
              type="button"
              onClick={() => setSelectedRole('consumer')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                selectedRole === 'consumer'
                  ? 'bg-white text-emerald-700 shadow-md shadow-slate-200 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <ShoppingCart className={`w-4 h-4 ${selectedRole === 'consumer' ? 'text-emerald-600' : ''}`} />
              <span>Consumer / Buyer 🛒</span>
            </button>

            {/* Farmer Choice */}
            <button
              type="button"
              onClick={() => setSelectedRole('farmer')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                selectedRole === 'farmer'
                  ? 'bg-white text-amber-800 shadow-md shadow-slate-200 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <Tractor className={`w-4 h-4 ${selectedRole === 'farmer' ? 'text-amber-600' : ''}`} />
              <span>Farmer / Producer 🌾</span>
            </button>
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            {selectedRole === 'farmer'
              ? '🌾 Farmers can add products, manage harvests, track earnings & ask AI for crop advice.'
              : '🛒 Consumers can browse fresh produce, order directly from farmers & receive smart recommendations.'}
          </p>
        </div>

        {/* Google Authentication */}
        <div className="space-y-3">
          <GoogleAuthButton role={selectedRole} text="signup_with" />
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs uppercase font-semibold text-slate-400">or register with details</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        {/* Registration Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Name & Username Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  {...register('name', { required: 'Full name is required' })}
                  className={`block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                    errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                  }`}
                  placeholder="Deva Datta"
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="text-xs font-bold">@</span>
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className="block w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="devadatta"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                className={`block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                placeholder="devadatta@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Create Password *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
                className={`block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                  errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>}
          </div>

          {/* Admin Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-[11px] text-amber-800">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Note:</strong> Admin accounts cannot be self-registered for platform security.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Register as {selectedRole === 'farmer' ? 'Farmer 🌾' : 'Consumer 🛒'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-1">
          <p className="text-xs text-slate-500">
            Already have a FarmEasy account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
