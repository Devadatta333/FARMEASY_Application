import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getFarmerAnalyticsApi } from '../../api/dashboardApi';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  IndianRupee,
  Package,
  Users,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Tractor,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  UserPlus,
  Info,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Available Date Range Presets
const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '3m', label: 'Last 3 Months' },
  { id: '1y', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

// Color mapping for order statuses matching Order model
const STATUS_COLORS = {
  Pending: { hex: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Confirmed: { hex: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Processing: { hex: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Shipped: { hex: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Delivered: { hex: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Cancelled: { hex: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

// Category palette
const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'];

export default function FarmerAnalytics() {
  const [range, setRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Sorting state for top products
  const [productSortBy, setProductSortBy] = useState('revenue'); // 'revenue' | 'quantity'

  // Fetch analytics from backend API
  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = { range };
      if (range === 'custom') {
        if (customStart) params.startDate = customStart;
        if (customEnd) params.endDate = customEnd;
      }

      const res = await getFarmerAnalyticsApi(params);
      if (res && res.success) {
        setAnalyticsData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to retrieve analytics data');
      }
    } catch (err) {
      console.error('Farmer Analytics Fetch Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unable to load analytics at this time';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setRange('custom');
    setIsCustomOpen(false);
    fetchAnalytics();
  };

  // Safe destructuring of analytics sections
  const summary = analyticsData?.summary || {
    revenue: 0,
    orders: 0,
    productsSold: 0,
    customers: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  };

  const revenueTrend = analyticsData?.revenueTrend || [];
  const orderStatus = analyticsData?.orderStatus || [];
  const topProducts = analyticsData?.topProducts || [];
  const productPerformance = analyticsData?.productPerformance || [];
  const customerAnalytics = analyticsData?.customerAnalytics || {
    totalUniqueCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    topCustomers: [],
  };
  const inventory = analyticsData?.inventory || {
    totalProducts: 0,
    totalActiveProducts: 0,
    healthyStockProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    threshold: 10,
    items: [],
  };
  const earnings = analyticsData?.earnings || {
    grossSales: 0,
    cancelledAmount: 0,
    platformFee: 0,
    netFarmerEarnings: 0,
    deliveredEarnings: 0,
    pendingPayouts: 0,
  };
  const categoryAnalytics = analyticsData?.categoryAnalytics || [];

  // Filter top products by sort preference
  const sortedTopProducts = useMemo(() => {
    return [...topProducts].sort((a, b) => {
      if (productSortBy === 'quantity') return b.quantitySold - a.quantitySold;
      return b.revenue - a.revenue;
    });
  }, [topProducts, productSortBy]);

  // Formatter helpers
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDateRangeLabel = () => {
    const opt = RANGE_OPTIONS.find((o) => o.id === range);
    if (range === 'custom' && customStart && customEnd) {
      return `${customStart} to ${customEnd}`;
    }
    return opt ? opt.label : 'Selected Range';
  };

  return (
    <DashboardLayout title="Farmer Analytics & Business Intelligence">
      <div className="space-y-6 pb-12">
        {/* ========================================================================= */}
        {/* HEADER BAR: TITLE, ACTIONS & DATE RANGE SELECTOR */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <BarChart3 className="w-3 h-3 text-emerald-700" />
                <span>Live Database Telemetry</span>
              </span>
              <span className="text-slate-400 text-xs">• 100% Real Farm Data</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight mt-1">
              Produce Sales & Revenue Analytics 📈
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time financial performance, customer insights, order statuses, and inventory health
            </p>
          </div>

          {/* Date Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 w-full lg:w-auto">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  if (opt.id === 'custom') {
                    setIsCustomOpen(true);
                  } else {
                    setRange(opt.id);
                    setIsCustomOpen(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  range === opt.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={loading || refreshing}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-all ml-1"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Range Drawer Modal */}
        <AnimatePresence>
          {isCustomOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-950/5 border border-emerald-800/20 rounded-2xl p-4 sm:p-5 text-xs overflow-hidden"
            >
              <form onSubmit={handleCustomRangeSubmit} className="flex flex-wrap items-end gap-3 sm:gap-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm shadow-emerald-600/20 transition-colors"
                  >
                    Apply Filter
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomOpen(false)}
                    className="bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-semibold border border-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ERROR STATE */}
        {/* ========================================================================= */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 text-rose-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Failed to Load Farmer Analytics</h4>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => fetchAnalytics(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. TOP 5 KPI SUMMARY CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-display text-slate-900 tracking-tight">
                {loading ? '...' : formatCurrency(summary.revenue)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span
                className={`font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] ${
                  summary.revenueGrowth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {summary.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{summary.revenueGrowth > 0 ? `+${summary.revenueGrowth}%` : `${summary.revenueGrowth}%`}</span>
              </span>
              <span className="text-[10px] text-slate-400">vs prior period</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Valid Orders</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-display text-slate-900 tracking-tight">
                {loading ? '...' : `${summary.orders} Orders`}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span
                className={`font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] ${
                  summary.ordersGrowth >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {summary.ordersGrowth >= 0 ? '+' : ''}
                {summary.ordersGrowth}%
              </span>
              <span className="text-[10px] text-slate-400">Order count</span>
            </div>
          </div>

          {/* Card 3: Products Sold */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Products Sold</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-display text-slate-900 tracking-tight">
                {loading ? '...' : `${summary.productsSold} Units`}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-slate-400 text-[10px] flex items-center justify-between">
              <span>Direct farmer harvest</span>
              <span className="text-amber-700 font-semibold">100% genuine</span>
            </div>
          </div>

          {/* Card 4: Unique Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Unique Customers</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-display text-slate-900 tracking-tight">
                {loading ? '...' : `${summary.customers} Buyers`}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-slate-400 text-[10px] flex items-center justify-between">
              <span>Direct consumers</span>
              <span className="text-purple-700 font-semibold">{customerAnalytics.returningCustomers} repeat</span>
            </div>
          </div>

          {/* Card 5: Average Order Value */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Order Value</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black font-display text-slate-900 tracking-tight">
                {loading ? '...' : formatCurrency(summary.averageOrderValue)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-slate-400 text-[10px] flex items-center justify-between">
              <span>Revenue / valid orders</span>
              <span className="text-indigo-700 font-semibold">Per order</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. REVENUE TREND & ORDERS TIMELINE (CHART) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Revenue & Sales Trend ({formatDateRangeLabel()})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily earnings trajectory and order volume from your crop produce listings
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Revenue (INR)</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span>Orders Count</span>
              </div>
            </div>
          </div>

          {/* Revenue Chart Viewport */}
          {loading ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
            </div>
          ) : revenueTrend.length === 0 || summary.revenue === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Sales Data for this Period</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No orders were placed for your farm produce in the selected date range. Try switching to a wider time range like "Last 30 Days" or "This Year".
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#08170e] text-white p-3 rounded-xl shadow-xl border border-emerald-800/40 text-xs space-y-1">
                            <span className="font-bold text-emerald-300 block">{label}</span>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-300">Revenue:</span>
                              <span className="font-bold text-emerald-400">
                                {formatCurrency(payload[0]?.value || 0)}
                              </span>
                            </div>
                            {payload[1] && (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-300">Orders:</span>
                                <span className="font-bold text-blue-400">
                                  {payload[1]?.value} orders
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                    name="Revenue"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#orderGrad)"
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. ORDER STATUS (DONUT) & SALES BY CATEGORY (BAR) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Order Status Distribution (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PieChartIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Order Status Breakdown
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Real Statuses</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Fulfillment pipeline of orders containing your produce
              </p>
            </div>

            {/* Donut Chart & Legend Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6 h-52 flex items-center justify-center">
                {orderStatus.some((s) => s.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatus.filter((s) => s.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="status"
                      >
                        {orderStatus
                          .filter((s) => s.count > 0)
                          .map((entry) => (
                            <Cell
                              key={`status-cell-${entry.status}`}
                              fill={STATUS_COLORS[entry.status]?.hex || '#94a3b8'}
                            />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val} orders`, name]}
                        contentStyle={{
                          background: '#08170e',
                          color: '#fff',
                          borderRadius: '12px',
                          border: '1px solid rgba(16,185,129,0.3)',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-xs text-slate-400">No orders recorded</div>
                )}
              </div>

              {/* Status List with Values */}
              <div className="sm:col-span-6 space-y-1.5">
                {orderStatus.map((st) => {
                  const theme = STATUS_COLORS[st.status] || {
                    hex: '#94a3b8',
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                  };
                  return (
                    <div
                      key={st.status}
                      className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.hex }}
                        />
                        <span className="font-semibold text-slate-800">{st.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{st.count}</span>
                        <span className="text-[10px] text-slate-400 w-10 text-right">
                          {st.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sales by Category (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Produce Sales by Category
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Agricultural Categories</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Volume and revenue across your crop categories from actual orders
              </p>
            </div>

            {categoryAnalytics.length > 0 ? (
              <div className="space-y-3">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryAnalytics} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Revenue']}
                        contentStyle={{
                          background: '#08170e',
                          color: '#fff',
                          borderRadius: '12px',
                          border: '1px solid rgba(16,185,129,0.3)',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]}>
                        {categoryAnalytics.map((entry, index) => (
                          <Cell
                            key={`cat-cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                  {categoryAnalytics.slice(0, 4).map((c, idx) => (
                    <div key={c.category} className="p-2 rounded-xl bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-400 truncate block font-medium">
                        {c.category}
                      </span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {formatCurrency(c.revenue)}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-semibold">
                        {c.quantitySold} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl">
                <Layers className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-slate-500">No Category Sales Recorded</span>
                <span className="text-[11px] text-slate-400">
                  Categories will populate once orders are received
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. TOP SELLING PRODUCTS & CUSTOMER LEADERBOARD */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Selling Products (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Top Selling Produce
                  </h3>
                  <p className="text-[11px] text-slate-400">Calculated strictly from your confirmed sales</p>
                </div>
              </div>

              {/* Sort Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setProductSortBy('revenue')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    productSortBy === 'revenue'
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  By Revenue
                </button>
                <button
                  onClick={() => setProductSortBy('quantity')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    productSortBy === 'quantity'
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  By Quantity
                </button>
              </div>
            </div>

            {sortedTopProducts.length > 0 ? (
              <div className="space-y-3">
                {sortedTopProducts.map((prod, idx) => (
                  <div
                    key={prod._id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                        <img
                          src={
                            prod.image?.startsWith('/uploads')
                              ? `http://localhost:3333${prod.image}`
                              : prod.image ||
                                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {prod.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {prod.ordersCount} orders placed
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 block">
                        {formatCurrency(prod.revenue)}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {prod.quantitySold} {prod.unit || 'units'} sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl">
                No products sold in this period yet.
              </div>
            )}
          </div>

          {/* Customer Analytics & Top Customers (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Customer Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400">Buyer retention and loyalty</p>
                </div>
              </div>
            </div>

            {/* New vs Returning Customer Split */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>New Buyers</span>
                </div>
                <div className="mt-1 text-xl font-black text-emerald-950">
                  {customerAnalytics.newCustomers}
                </div>
                <span className="text-[10px] text-emerald-700/80">First purchase in period</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center gap-1.5 text-purple-800 text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Returning</span>
                </div>
                <div className="mt-1 text-xl font-black text-purple-950">
                  {customerAnalytics.returningCustomers}
                </div>
                <span className="text-[10px] text-purple-700/80">Repeat farm buyers</span>
              </div>
            </div>

            {/* Top Customers Leaderboard */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Top Spending Customers
              </span>

              {customerAnalytics.topCustomers?.length > 0 ? (
                <div className="space-y-2">
                  {customerAnalytics.topCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {cust.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 leading-tight">{cust.name}</h5>
                          <span className="text-[10px] text-slate-400">
                            {cust.location} • {cust.maskedEmail}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 block">
                          {formatCurrency(cust.totalSpent)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No customer orders in this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. PRODUCT PERFORMANCE CATALOG TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900">
                  Product Catalog Performance
                </h3>
                <p className="text-[11px] text-slate-400">
                  Individual harvest listings, unit sales, inventory stock levels, and revenue
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/farmer/products"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-center"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider rounded-xl">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Produce Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Unit Price</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Stock Status</th>
                  <th className="py-3 px-3">Units Sold</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.length > 0 ? (
                  productPerformance.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {prod.image ? (
                            <img
                              src={
                                prod.image.startsWith('/uploads')
                                  ? `http://localhost:3333${prod.image}`
                                  : prod.image
                              }
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="truncate max-w-[180px]">{prod.name}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[10px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        ₹{prod.price}/{prod.unit}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {prod.currentStock} {prod.unit}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            prod.stockStatus === 'Out of Stock'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : prod.stockStatus === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {prod.stockStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {prod.unitsSold} {prod.unit}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-900">
                        {formatCurrency(prod.revenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                        {prod.ordersCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No produce listings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. INVENTORY HEALTH & STOCK ALERTS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inventory Health Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold font-display text-slate-900">
                  Inventory Health
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Threshold: ≤{inventory.threshold}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">Healthy Stock</span>
                </div>
                <span className="text-base font-black text-emerald-700">
                  {inventory.healthyStockProducts} items
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-950">Low Stock Alert</span>
                </div>
                <span className="text-base font-black text-amber-700">
                  {inventory.lowStockProducts} items
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-950">Out of Stock</span>
                </div>
                <span className="text-base font-black text-rose-700">
                  {inventory.outOfStockProducts} items
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard/farmer/products"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Replenish Stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Inventory Items List (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold font-display text-slate-900">
                Inventory Stock Telemetry
              </h3>
              <span className="text-xs text-slate-400">Sorted by critical stock</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider rounded-xl">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">Produce</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Current Stock</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.items?.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.category}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-2.5 px-3">₹{item.price}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Out of Stock'
                              ? 'bg-rose-100 text-rose-800'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. EARNINGS & SETTLEMENT BREAKDOWN */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-[#0c2e1b] via-[#103a23] to-[#081c11] text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-elevated space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Direct Farm-to-Consumer Model</span>
                </span>
                <span className="text-emerald-300/80 text-xs">• 0% Commission</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-1">
                Farmer Financial Ledger & Payout Settlement
              </h3>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Exact financial calculation adhering to FarmEasy's transparent farmer payment flow
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-emerald-300/80 uppercase tracking-wider block">
                Net Farmer Earnings
              </span>
              <span className="text-2xl sm:text-3xl font-black font-display text-white">
                {formatCurrency(earnings.netFarmerEarnings)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Gross Sales */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">
                Gross Order Value
              </span>
              <div className="text-xl font-black text-white mt-1">
                {formatCurrency(earnings.grossSales)}
              </div>
              <p className="text-[10px] text-emerald-200/60 mt-1">
                Total crop value of all placed orders
              </p>
            </div>

            {/* Box 2: Deductions & Cancellations */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">
                Cancelled Orders Deductions
              </span>
              <div className="text-xl font-black text-rose-300 mt-1">
                - {formatCurrency(earnings.cancelledAmount)}
              </div>
              <p className="text-[10px] text-emerald-200/60 mt-1">
                Inventory replenished automatically
              </p>
            </div>

            {/* Box 3: Realized Delivered */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                Realized / Delivered
              </span>
              <div className="text-xl font-black text-emerald-300 mt-1">
                {formatCurrency(earnings.deliveredEarnings)}
              </div>
              <p className="text-[10px] text-emerald-200/60 mt-1">
                Completed & delivered consumer orders
              </p>
            </div>

            {/* Box 4: Pending Payouts */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                In-Transit / Pending Delivery
              </span>
              <div className="text-xl font-black text-amber-300 mt-1">
                {formatCurrency(earnings.pendingPayouts)}
              </div>
              <p className="text-[10px] text-emerald-200/60 mt-1">
                Processing and shipped produce
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between text-xs text-emerald-200/80 gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Platform Fee: ₹0 (0%)</strong> — FarmEasy guarantees 100% of product sales value is credited directly to the farmer.
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Delivery logistics handled at platform checkout
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
