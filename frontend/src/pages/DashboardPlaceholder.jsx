import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout } from '../redux/slices/authSlice';
import { Sprout, Tractor, ShoppingCart, ShieldCheck, User, Mail, Calendar, KeyRound, LogOut, Sparkles } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const DashboardPlaceholder = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [roleMessage, setRoleMessage] = useState('');

  useEffect(() => {
    // Call role-specific test endpoint to verify role authorization middleware
    if (user?.role) {
      const endpoint = user.role === 'admin' ? '/users/admin' : user.role === 'farmer' ? '/users/farmer' : '/users/consumer';
      axiosClient
        .get(endpoint)
        .then((res) => setRoleMessage(res.data.message))
        .catch((err) => console.log('Role test error', err));
    }
  }, [user]);

  const renderRoleBanner = () => {
    switch (user?.role) {
      case 'farmer':
        return (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-lg shadow-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                🌾
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-100">Authenticated Role</span>
                <h3 className="text-2xl font-black">Farmer Portal Dashboard</h3>
                <p className="text-xs text-amber-50 mt-1">
                  Phase 1 Auth Complete! Ready for Phase 2 Sales Analytics, Products & AI Crop Chatbot.
                </p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/30">
              Role Verified: Farmer
            </span>
          </div>
        );
      case 'admin':
        return (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                ⚡
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-purple-200">Authenticated Role</span>
                <h3 className="text-2xl font-black">Platform Admin Operations</h3>
                <p className="text-xs text-purple-100 mt-1">
                  Phase 1 Auth Complete! Ready for Phase 2 User Management, Revenue & Reports.
                </p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/30">
              Role Verified: Admin
            </span>
          </div>
        );
      default:
        return (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                🛒
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-100">Authenticated Role</span>
                <h3 className="text-2xl font-black">Consumer Marketplace Portal</h3>
                <p className="text-xs text-emerald-50 mt-1">
                  Phase 1 Auth Complete! Ready for Phase 2 Products, Smart Recommendations & Orders.
                </p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/30">
              Role Verified: Consumer
            </span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderRoleBanner()}
      </motion.div>

      {/* User Information Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-4">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{user?.name}</h2>
              <p className="text-sm font-medium text-emerald-600">@{user?.username || 'user'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>JWT Session Active</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400">
              <Mail className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Email Address</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 break-all">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400">
              <User className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Assigned Role</span>
            </div>
            <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">{user?.role}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400">
              <KeyRound className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Auth Status</span>
            </div>
            <p className="text-sm font-semibold text-emerald-600">Verified & Protected</p>
          </div>
        </div>

        {/* Backend Middleware verification badge */}
        {roleMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Backend Authorization Test: "{roleMessage}"</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">Passed</span>
          </div>
        )}

        {/* Status Box */}
        <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center space-x-2">
              <span>🚀 Phase 1 Authentication Module Verified</span>
            </h4>
            <span className="text-xs text-slate-400">Phase 1 / 8</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Congratulations! The <strong>Login, Registration, Google Auth, Password Hashing, JWT Token Generation, and Role-Based Authorization</strong> module has been successfully implemented and validated.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
            <span className="bg-slate-800 px-2.5 py-1 rounded">✔ User Registration</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded">✔ Password Hashing (Bcrypt)</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded">✔ JWT Authentication</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded">✔ Role Authorization (Farmer/Consumer/Admin)</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded">✔ Google Identity Services</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded">✔ Forgot/Reset Password</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPlaceholder;
