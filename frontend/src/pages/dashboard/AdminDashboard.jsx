import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { getAdminDashboardApi } from '../../api/dashboardApi';
import {
  Users,
  Tractor,
  Package,
  ShoppingBag,
  IndianRupee,
  Shield,
  TrendingUp,
  BarChart3,
  UserCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardApi()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin dashboard:', err);
        setLoading(false);
      });
  }, []);

  const handleAdminAction = (actionName) => {
    toast.success(`${actionName} console panel activated!`, {
      icon: '⚡',
    });
  };

  const stats = data?.stats || {
    totalUsers: 142,
    totalFarmers: 45,
    totalConsumers: 97,
    totalProducts: 340,
    totalOrders: 1250,
    totalRevenue: 485000,
  };
  const recentUsers = data?.recentUsers || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <DashboardLayout title="System Administration">
      <div className="space-y-7">
        {/* Admin Executive Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#101e18] to-[#0d281a] text-white p-6 sm:p-8 shadow-elevated border border-emerald-900/40"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-md">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Platform Command Center</span>
                </span>
                <span className="text-xs text-emerald-400/80 font-mono">NODE-INDIA-WEST • ONLINE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                FarmEasy Global Operations ⚡
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Centralized oversight for verified farmer registrations, product catalog standards, payment settlement, and agronomic security audits.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md shrink-0"
              onClick={() => handleAdminAction('System Audit Export')}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Export Audit Log
            </Button>
          </div>
        </motion.div>

        {/* 5 Executive Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Users"
            value={loading ? '...' : stats.totalUsers}
            change="14 this week"
            icon={Users}
            color="purple"
            chartData={[110, 118, 124, 130, 135, 138, 142]}
          />
          <StatCard
            title="Farmers"
            value={loading ? '...' : stats.totalFarmers}
            change="5 new"
            icon={Tractor}
            color="amber"
            chartData={[32, 35, 36, 38, 40, 42, 45]}
          />
          <StatCard
            title="Products Listed"
            value={loading ? '...' : stats.totalProducts}
            change="24 active"
            icon={Package}
            color="emerald"
            chartData={[280, 290, 305, 312, 320, 335, 340]}
          />
          <StatCard
            title="Total Orders"
            value={loading ? '...' : stats.totalOrders}
            change="125 weekly"
            icon={ShoppingBag}
            color="blue"
            chartData={[980, 1020, 1070, 1120, 1180, 1220, 1250]}
          />
          <StatCard
            title="Total GMV"
            value={loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            change="32% MoM"
            icon={IndianRupee}
            color="teal"
            chartData={[350000, 380000, 410000, 435000, 460000, 475000, 485000]}
          />
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Platform Administration Controls</span>
            </h3>
            <span className="text-xs text-slate-400">Operations Console</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleAdminAction('User Moderation')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/60 text-purple-900 hover:bg-purple-100 border border-purple-200/60 transition-all font-semibold text-xs text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="truncate">Manage Users</span>
            </button>

            <button
              onClick={() => handleAdminAction('Farmer Verification')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/60 text-amber-900 hover:bg-amber-100 border border-amber-200/60 transition-all font-semibold text-xs text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                <Tractor className="w-4 h-4" />
              </div>
              <span className="truncate">Verify Farmers</span>
            </button>

            <button
              onClick={() => handleAdminAction('Product Moderation')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60 transition-all font-semibold text-xs text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <span className="truncate">Product Catalog</span>
            </button>

            <button
              onClick={() => handleAdminAction('Payout Settlements')}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50/60 text-sky-900 hover:bg-sky-100 border border-sky-200/60 transition-all font-semibold text-xs text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="truncate">Settlements</span>
            </button>
          </div>
        </div>

        {/* Data Tables Section: Users & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Recent Platform Registrations</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer">
                All accounts &rarr;
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentUsers.map((usr) => (
                    <tr key={usr._id || usr.email} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{usr.name}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                        {usr.email}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            usr.role === 'farmer'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : usr.role === 'admin'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Recent Platform Transactions</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer">
                All transactions &rarr;
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-3">Buyer</th>
                    <th className="py-2 px-3">Farmer</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{ord.customer}</td>
                      <td className="py-3 px-3 text-slate-500">{ord.farmer}</td>
                      <td className="py-3 px-3 font-bold font-display text-slate-900">
                        ₹{ord.amount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
