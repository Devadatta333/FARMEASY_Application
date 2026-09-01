import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { getConsumerDashboardApi } from '../../api/dashboardApi';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ConsumerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsumerDashboardApi()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching consumer dashboard:', err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (productName) => {
    toast.success(`Added "${productName}" to your cart! Cart module unlocks in Phase 5.`, {
      icon: '🛒',
    });
  };

  const consumerName = user?.name || data?.consumer?.name || 'Consumer';
  const stats = data?.stats || {
    totalOrders: 8,
    cartItems: 3,
    wishlistItems: 12,
    recentlyViewed: 15,
  };
  const categories = data?.featuredCategories || [];
  const products = data?.recommendedProducts || [];
  const orders = data?.recentOrders || [];

  return (
    <DashboardLayout title="Consumer Marketplace">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-700/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="bg-emerald-400/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                🌱 Direct Farm-to-Table
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Hello, {consumerName}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Discover fresh, organic produce harvested straight from local farmers near you. No middlemen, 100% fair pricing.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard/user/products')}
              className="flex items-center space-x-2 bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ShoppingCart className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 pointer-events-none" />
        </motion.div>

        {/* Quick Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="My Orders"
            value={loading ? '...' : stats.totalOrders}
            change="2 active"
            icon={ShoppingBag}
            color="emerald"
          />
          <StatCard
            title="Cart Items"
            value={loading ? '...' : stats.cartItems}
            change="Ready for checkout"
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Wishlist"
            value={loading ? '...' : stats.wishlistItems}
            change="Saved items"
            icon={Heart}
            color="amber"
          />
          <StatCard
            title="Recently Viewed"
            value={loading ? '...' : stats.recentlyViewed}
            change="Products"
            icon={Eye}
            color="teal"
          />
        </div>

        {/* Featured Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Featured Agricultural Categories</span>
            </h3>
            <Link to="/dashboard/user/products" className="text-xs text-emerald-600 font-semibold hover:underline">
              Browse All Categories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                onClick={() => navigate('/dashboard/user/products')}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-900 h-44 shadow-lg cursor-pointer border border-slate-200"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    {cat.count}
                  </span>
                  <h4 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Smart Recommended Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Recommended Fresh Produce 🌾
            </h3>
            <Link to="/dashboard/user/products" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => navigate('/dashboard/user/products')}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {prod.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1 cursor-pointer" onClick={() => navigate('/dashboard/user/products')}>
                      {prod.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-400 truncate">
                      👨‍🌾 {prod.farmerName}
                    </p>

                    <div className="flex items-center space-x-1 text-amber-500 text-xs pt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-800">{prod.rating}</span>
                      <span className="text-slate-400 text-[10px]">({prod.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-lg font-black text-slate-900">₹{prod.price}</span>
                    <span className="text-[11px] text-slate-400"> / {prod.unit}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(prod.name)}
                    className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                    title="Add to Cart"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cart</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Orders Placeholder List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Recent Orders History</span>
            </h3>
            <span className="text-xs text-slate-400">Phase 6 Order Tracking</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    📦
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{ord.item}</h4>
                    <p className="text-[11px] text-slate-500">
                      Order ID: <strong>{ord.id}</strong> • Farmer: {ord.farmer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-black text-slate-900">₹{ord.amount}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConsumerDashboard;
