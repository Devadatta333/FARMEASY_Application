import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Droplets,
  Sun,
} from 'lucide-react';
import { Button, EmptyState, WeatherWidget, MiniChart } from '../../components/ui';
import toast from 'react-hot-toast';

export default function FarmerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
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

  const farmerName = user?.name || data?.farmer?.name || 'Farmer';
  const stats = data?.stats || {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  };
  const activities = data?.recentActivities || [];

  return (
    <DashboardLayout title="Farmer Operations Hub">
      <div className="space-y-6">
        {/* Top Hero & Weather Banner: Asymmetric 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Farm Status Overview (8 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2e1b] via-[#103a23] to-[#081c11] text-white p-7 sm:p-8 shadow-elevated border border-emerald-800/40 flex flex-col justify-between"
          >
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5 backdrop-blur-md">
                  <Tractor className="w-3.5 h-3.5" />
                  <span>Verified Producer Hub</span>
                </span>
                <span className="text-xs text-emerald-300/80 font-medium">
                  • Direct Harvest Active
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white leading-tight">
                Welcome back, {farmerName}! 🌾
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
                Your direct farm-to-consumer store is live. Zero middleman fees, transparent payouts, and real-time agricultural telemetry.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-emerald-200/90">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Direct Payouts Enabled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Crop Guarantee Active</span>
                </div>
              </div>

              <Button
                variant="harvest"
                size="sm"
                onClick={() => navigate('/dashboard/farmer/products')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add New Harvest
              </Button>
            </div>
          </motion.div>

          {/* Microclimate Weather Widget (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <WeatherWidget userLocation={user?.location} className="h-full" />
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Total Products Listed"
            value={loading ? '...' : stats.totalProducts}
            change={stats.totalProducts > 0 ? "Active listings" : "No listings yet"}
            icon={Package}
            color="amber"
          />
          <StatCard
            title="Total Orders Received"
            value={loading ? '...' : stats.totalOrders}
            change={stats.totalOrders > 0 ? "Orders placed" : "No orders yet"}
            icon={ShoppingBag}
            color="emerald"
          />
          <StatCard
            title="Total Revenue (INR)"
            value={loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            change={stats.totalRevenue > 0 ? "Direct earnings" : "₹0 sales"}
            icon={IndianRupee}
            color="blue"
          />
          <StatCard
            title="Pending Orders"
            value={loading ? '...' : stats.pendingOrders}
            change={stats.pendingOrders > 0 ? "Requires action" : "All cleared"}
            trend={stats.pendingOrders > 0 ? "up" : "down"}
            icon={Clock}
            color="rose"
          />
        </div>

        {/* Quick Actions Strip */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                Quick Farmer Controls
              </h4>
              <p className="text-[11px] text-slate-400">Manage crop listings, orders, and AI advisory</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/farmer/products')}
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
            >
              List Crop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/user/products')}
              leftIcon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
            >
              Storefront
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/farmer/orders')}
              leftIcon={<ShoppingBag className="w-3.5 h-3.5 text-amber-600" />}
            >
              Orders
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success('AI Advisory Hub Active! 🌾')}
              leftIcon={<Bot className="w-3.5 h-3.5 text-emerald-700" />}
            >
              AI Advisory
            </Button>
          </div>
        </div>

        {/* Main Content Grid: Activity Timeline + Agronomic Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Activity Feed (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold font-display text-slate-900">
                  Recent Farm & Order Activity
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Real-time sync</span>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {act.details}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No recent farm activities"
                description="Your recent crop listings, order dispatches, and payout receipts will display here."
                actionText="List your first harvest"
                onAction={() => handleQuickAction('List First Harvest')}
              />
            )}
          </div>

          {/* Right: AI Crop Health & Recommendations (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Crop Recommendation Box */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 rounded-3xl p-6 border border-emerald-100/80 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-sans">
                    AI Agronomic Feed
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-xs shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Wheat Harvest Peak</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Regional market price for Sharbati Wheat is up 14% this week. Consider listing pending stocks.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-xs shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Irrigation Advisory</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Dry spell predicted for the next 4 days. Schedule drip irrigation for vegetable nurseries.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => handleQuickAction('Full Agronomic Diagnosis')}
              >
                Open Full AI Agronomist
              </Button>
            </div>

            {/* Crop Health Indicators */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                Soil & Field Telemetry
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Soil Nitrogen & Minerals</span>
                    <span className="text-emerald-700 font-bold">88% (Healthy)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-[88%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Canopy Moisture Index</span>
                    <span className="text-emerald-700 font-bold">72% (Optimal)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[72%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Pest Risk Level</span>
                    <span className="text-emerald-600 font-bold">Low (5%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[5%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
