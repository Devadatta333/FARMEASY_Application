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
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
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
    toast.success(`${actionName} console will be unlocked in Phase 8 (Admin Management)!`, {
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
    <DashboardLayout title="Admin Control Operations">
      <div className="space-y-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-purple-900/40"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Platform System Administrator</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                FarmEasy System Operations ⚡
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                Monitor user accounts, farmer registrations, catalog listings, order flows, platform revenue, and security controls across all regions.
              </p>
            </div>

            <button
              onClick={() => handleAdminAction('System Reports')}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>

          <Shield className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 pointer-events-none" />
        </motion.div>

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Users"
            value={loading ? '...' : stats.totalUsers}
            change="14 this week"
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Farmers"
            value={loading ? '...' : stats.totalFarmers}
            change="5 new"
            icon={Tractor}
            color="amber"
          />
          <StatCard
            title="Total Products"
            value={loading ? '...' : stats.totalProducts}
            change="24 active"
            icon={Package}
            color="emerald"
          />
          <StatCard
            title="Total Orders"
            value={loading ? '...' : stats.totalOrders}
            change="125 this week"
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={loading ? '...' : `₹ ${(stats.totalRevenue / 1000).toFixed(1)}k`}
            change="32%"
            icon={IndianRupee}
            color="teal"
          />
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Quick Admin Control Actions</span>
            </h3>
            <span className="text-xs text-slate-400">Phase 8 Management Console</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleAdminAction('Manage Users')}
              className="flex items-center space-x-3 p-4 rounded-2xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 transition-all font-semibold text-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <span>Manage Users</span>
            </button>

            <button
              onClick={() => handleAdminAction('Manage Farmers')}
              className="flex items-center space-x-3 p-4 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-all font-semibold text-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <Tractor className="w-4 h-4" />
              </div>
              <span>Manage Farmers</span>
            </button>

            <button
              onClick={() => handleAdminAction('Manage Products')}
              className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 transition-all font-semibold text-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <span>Manage Products</span>
            </button>

            <button
              onClick={() => handleAdminAction('System Reports')}
              className="flex items-center space-x-3 p-4 rounded-2xl bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition-all font-semibold text-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <span>Export Reports</span>
            </button>
          </div>
        </div>

        {/* Analytics Section Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Analytics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>User & Farmer Growth Analytics</span>
              </h3>
              <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            </div>
            <div className="h-44 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <p className="text-xs font-bold text-slate-700">Platform Growth Visualizer</p>
              <p className="text-[11px] text-slate-400">
                Detailed charts for Monthly Active Users & Farmer onboarding analytics will plug in Phase 8.
              </p>
            </div>
          </div>

          {/* Platform Sales & Revenue Analytics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-teal-600" />
                <span>Platform GMV & Revenue Stream</span>
              </h3>
              <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            </div>
            <div className="h-44 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <BarChart3 className="w-8 h-8 text-teal-400" />
              <p className="text-xs font-bold text-slate-700">Razorpay Revenue Analytics</p>
              <p className="text-[11px] text-slate-400">
                Transaction settlement analytics will be enabled upon Razorpay integration in Phase 7.
              </p>
            </div>
          </div>
        </div>

        {/* Data Tables Section: Recent Users & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Registered Users & Farmers</span>
              </h3>
              <span className="text-xs font-semibold text-purple-600 cursor-pointer hover:underline">
                View All Users &rarr;
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.map((usr) => (
                    <tr key={usr._id || usr.email} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{usr.name}</td>
                      <td className="py-3 px-3 text-slate-500">{usr.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            usr.role === 'farmer'
                              ? 'bg-amber-100 text-amber-800'
                              : usr.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent System Orders Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Recent Platform Orders</span>
              </h3>
              <span className="text-xs font-semibold text-purple-600 cursor-pointer hover:underline">
                View All Orders &rarr;
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Farmer</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{ord.customer}</td>
                      <td className="py-3 px-3 text-slate-500">{ord.farmer}</td>
                      <td className="py-3 px-3 text-slate-700">{ord.product}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{ord.amount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
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
};

export default AdminDashboard;
