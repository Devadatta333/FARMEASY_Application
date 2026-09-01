import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { getFarmerDashboardApi } from '../../api/dashboardApi';
import {
  Tractor,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  Plus,
  Eye,
  Bot,
  TrendingUp,
  Sparkles,
  Activity,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFarmerDashboardApi()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching farmer dashboard:', err);
        setLoading(false);
      });
  }, []);

  const handleQuickAction = (actionName) => {
    toast.success(`${actionName} feature will be unlocked in Phase 3 (Product Management & AI)!`, {
      icon: '🌾',
    });
  };

  const farmerName = user?.name || data?.farmer?.name || 'Farmer';
  const stats = data?.stats || {
    totalProducts: 12,
    totalOrders: 48,
    totalRevenue: 24500,
    pendingOrders: 5,
  };
  const activities = data?.recentActivities || [];

  return (
    <DashboardLayout title="Farmer Portal">
      <div className="space-y-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 flex items-center space-x-1">
                  <Tractor className="w-3.5 h-3.5" />
                  <span>Verified Producer</span>
                </span>
                <span className="text-xs text-emerald-200">• Season Harvest 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {farmerName}! 🌾
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                "Your hard work feeds thousands of families. FarmEasy directly connects your farm's harvest to consumers with zero middlemen."
              </p>
            </div>

            <button
              onClick={() => handleQuickAction('Add New Crop')}
              className="flex items-center space-x-2 bg-white text-emerald-900 hover:bg-amber-100 px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Harvest</span>
            </button>
          </div>

          {/* Decorative background watermark */}
          <Tractor className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 pointer-events-none" />
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Products"
            value={loading ? '...' : stats.totalProducts}
            change="12%"
            icon={Package}
            color="amber"
          />
          <StatCard
            title="Total Orders"
            value={loading ? '...' : stats.totalOrders}
            change="18%"
            icon={ShoppingBag}
            color="emerald"
          />
          <StatCard
            title="Total Revenue"
            value={loading ? '...' : `₹ ${stats.totalRevenue.toLocaleString()}`}
            change="24%"
            icon={IndianRupee}
            color="teal"
          />
          <StatCard
            title="Pending Orders"
            value={loading ? '...' : stats.pendingOrders}
            change="2 orders"
            trend="down"
            icon={Clock}
            color="blue"
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Quick Farmer Actions</span>
            </h3>
            <span className="text-xs text-slate-400">Phase 2 Dashboard Controls</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleQuickAction('Add Product')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all font-semibold text-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Plus className="w-5 h-5" />
              </div>
              <span>Add Product</span>
            </button>

            <button
              onClick={() => handleQuickAction('View Products')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all font-semibold text-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5" />
              </div>
              <span>View Products</span>
            </button>

            <button
              onClick={() => handleQuickAction('Manage Orders')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all font-semibold text-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span>Manage Orders</span>
            </button>

            <button
              onClick={() => handleQuickAction('AI Crop Assistant')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-all font-semibold text-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="flex items-center space-x-1">
                <span>AI Crop Chatbot</span>
                <span className="bg-purple-200 text-purple-900 text-[9px] px-1 rounded font-bold">Soon</span>
              </span>
            </button>
          </div>
        </div>

        {/* Grid Section: Recent Activity & Sales Analytics Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Recent Farm Activity</span>
              </h3>
              <span className="text-xs text-slate-400">Live Updates</span>
            </div>

            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Analytics Placeholder (1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Sales Analytics</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>

              {/* Chart Placeholder graphic */}
              <div className="h-48 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <TrendingUp className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Interactive Sales & Harvest Charts</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time revenue tracking and yield forecasts will be connected in Phase 7.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
              <span>Monthly Target Progress: <strong>78%</strong></span>
              <span className="font-bold text-emerald-700">₹ 24,500 / ₹ 30,000</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
