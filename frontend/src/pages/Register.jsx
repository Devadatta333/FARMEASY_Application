import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearMessages } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Tractor,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Button, Input, StepIndicator } from '../components/ui';
import toast from 'react-hot-toast';

const INTEREST_OPTIONS = [
  { id: 'wheat', label: 'Wheat & Grains 🌾' },
  { id: 'rice', label: 'Paddy & Rice 🍚' },
  { id: 'vegetables', label: 'Fresh Vegetables 🥬' },
  { id: 'fruits', label: 'Orchard Fruits 🍎' },
  { id: 'pulses', label: 'Pulses & Lentils 🫘' },
  { id: 'organic', label: 'Certified Organic 🌿' },
  { id: 'dairy', label: 'Farm Fresh Dairy 🥛' },
  { id: 'spices', label: 'Spices & Herbs 🌶️' },
];

const STEPS = [
  { title: 'Account' },
  { title: 'Role' },
  { title: 'Interests' },
  { title: 'Review' },
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('consumer');
  const [selectedInterests, setSelectedInterests] = useState(['vegetables', 'fruits']);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password') || '';

  // Calculate simple password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(passwordValue);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['name', 'email', 'password']);
      if (!isValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async () => {
    const data = getValues();
    dispatch(clearMessages());

    // Derive username from email if left blank
    const cleanUsername =
      data.username?.trim() ||
      data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    const payload = {
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email.trim(),
      password: data.password,
      role: selectedRole,
    };

    dispatch(registerUser(payload))
      .unwrap()
      .then((res) => {
        toast.success(res.message || 'Registration complete! Welcome to FarmEasy.');
        navigate('/dashboard');
      })
      .catch((err) => {
        toast.error(err || 'Registration failed. Please try again.');
      });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#fbfcf8]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-elevated border border-slate-100 p-6 sm:p-10"
      >
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 mb-3 shadow-subtle">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            {currentStep === 1 && 'Create your FarmEasy account'}
            {currentStep === 2 && 'Select your agricultural role'}
            {currentStep === 3 && 'What are your primary interests?'}
            {currentStep === 4 && 'Confirm & launch your journey 🌱'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {currentStep === 1 && 'Direct connection between verified farmers and smart buyers.'}
            {currentStep === 2 && 'Tailor your experience based on how you plan to use FarmEasy.'}
            {currentStep === 3 && 'Select crops or categories to personalize your market intelligence.'}
            {currentStep === 4 && 'Review your profile before creating your FarmEasy account.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Animated Wizard Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* STEP 1: Account Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Google Auth Quick Option */}
                <div className="space-y-3">
                  <GoogleAuthButton role={selectedRole} text="signup_with" />
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="shrink-0 px-3 text-xs uppercase font-medium text-slate-400 bg-white">
                      or register manually
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    placeholder="Deva Datta"
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.name?.message}
                    {...register('name', { required: 'Full name is required' })}
                  />

                  <Input
                    label="Username"
                    placeholder="devadatta (optional)"
                    leftIcon={<span className="text-xs font-bold text-slate-400">@</span>}
                    {...register('username')}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="farmer@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
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

                  {/* Password Strength Meter */}
                  {passwordValue.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            strength >= 1 ? 'bg-rose-500' : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            strength >= 2 ? 'bg-amber-500' : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            strength >= 3 ? 'bg-emerald-500' : 'bg-transparent'
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            strength >= 4 ? 'bg-emerald-600' : 'bg-transparent'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {strength <= 1 && 'Weak'}
                        {strength === 2 && 'Fair'}
                        {strength === 3 && 'Good'}
                        {strength >= 4 && 'Strong'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Role Selection */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Consumer Role Card */}
                  <div
                    onClick={() => setSelectedRole('consumer')}
                    className={`relative p-5 rounded-2xl cursor-pointer border-2 transition-all duration-200 text-left ${
                      selectedRole === 'consumer'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-4 ring-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedRole === 'consumer'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedRole === 'consumer' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 text-base mb-1">
                      Consumer / Buyer 🛒
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      Order fresh produce directly from verified farmers without middleman markups.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct farm-to-table delivery</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Real-time harvest updates</span>
                      </li>
                    </ul>
                  </div>

                  {/* Farmer Role Card */}
                  <div
                    onClick={() => setSelectedRole('farmer')}
                    className={`relative p-5 rounded-2xl cursor-pointer border-2 transition-all duration-200 text-left ${
                      selectedRole === 'farmer'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-4 ring-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
                        <Tractor className="w-6 h-6" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedRole === 'farmer'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedRole === 'farmer' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 text-base mb-1">
                      Farmer / Producer 🌾
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      List your crops, sell at fair market rates, and tap into AI agronomic forecasts.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>0% commission on sales</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AI crop disease diagnosis</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Crop / Category Interests */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600 text-center mb-2">
                  Select categories you produce or buy most often:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INTEREST_OPTIONS.map((item) => {
                    const isSelected = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all duration-200 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20 scale-[1.02]'
                            : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>These preferences personalize your dashboard and market price alerts.</span>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Confirmation & Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-xs text-slate-400">Full Name</span>
                      <div className="text-sm font-bold text-slate-800 font-display">
                        {getValues('name') || '—'}
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">
                      {selectedRole === 'farmer' ? '🌾 Farmer' : '🛒 Consumer'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-xs text-slate-400">Email</span>
                      <div className="text-xs font-semibold text-slate-700 truncate">
                        {getValues('email') || '—'}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Username</span>
                      <div className="text-xs font-semibold text-slate-700 truncate">
                        @{getValues('username') || getValues('email')?.split('@')[0] || '—'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5">Selected Interests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInterests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          {INTEREST_OPTIONS.find((o) => o.id === interest)?.label || interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>By registering, you agree to FarmEasy's Fair Trade and Platform Terms.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create FarmEasy Account
              </Button>
            )}
          </div>
        </form>

        {/* Existing account prompt */}
        <div className="mt-6 pt-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered with FarmEasy?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
