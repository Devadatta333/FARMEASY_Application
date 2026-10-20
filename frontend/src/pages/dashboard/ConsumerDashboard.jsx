import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { getConsumerDashboardApi } from '../../api/dashboardApi';
import { addToCart } from '../../redux/slices/cartSlice';
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
  Truck,
  ShieldCheck,
  Tag,
  Bot,
} from 'lucide-react';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ConsumerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart || { totalItems: 0 });
  const dispatch = useDispatch();
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

  const handleAddToCartProduct = (product) => {
    dispatch(
      addToCart({
        product: {
          _id: product.id || product._id || String(Date.now()),
          name: product.name,
          price: product.price,
          unit: product.unit || 'kg',
          category: product.category || 'Produce',
          image: product.image,
          farmerName: product.farmerName || 'Verified Local Farmer',
          farmerId: product.farmerId || product.farmer?._id || product.farmer,
        },
        quantity: 1,
      })
    );
    toast.success(`Added "${product.name}" to cart! 🛒`);
  };

  const consumerName = user?.name || data?.consumer?.name || 'Consumer';
  const stats = data?.stats || {
    totalOrders: 0,
    wishlistItems: 0,
    recentlyViewed: 0,
  };
  const categories = data?.featuredCategories || [];
  const products = data?.recommendedProducts || [];
  const orders = data?.recentOrders || [];

  return (
    <DashboardLayout title="Marketplace Portal">
      <div className="space-y-7">
        {/* Welcome Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-forest-800 to-teal-900 text-white p-6 sm:p-8 shadow-elevated border border-emerald-700/40"
        >
          {/* Subtle lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 backdrop-blur-md">
                <span>🌱</span>
                <span>Direct Harvest Network • 100% Middleman-Free</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                Hello, {consumerName}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Fresh produce harvested straight from certified local farms. Verified pesticide-free, fair pricing, and direct-to-home delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="harvest"
                size="md"
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold border-none shadow-md"
                onClick={() => navigate('/dashboard/user/ai-assistant')}
                leftIcon={<Bot className="w-4 h-4 text-slate-950" />}
              >
                AI Produce Guide
              </Button>
              <Button
                variant="outline"
                size="md"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 shadow-sm"
                onClick={() => navigate('/dashboard/user/products')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore Crops
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div
            onClick={() => navigate('/dashboard/user/orders')}
            className="cursor-pointer"
            title="View Order History"
          >
            <StatCard
              title="My Orders"
              value={loading ? '...' : stats.totalOrders}
              change={loading ? '' : 'Live updated'}
              icon={ShoppingBag}
              color="emerald"
              chartData={[]}
            />
          </div>

          <div
            onClick={() => navigate('/dashboard/user/cart')}
            className="cursor-pointer"
            title="View Shopping Cart"
          >
            <StatCard
              title="Items in Cart"
              value={totalItems}
              change="Tap to checkout →"
              icon={ShoppingCart}
              color="blue"
              chartData={[]}
            />
          </div>

          <div
            onClick={() => navigate('/dashboard/user/wishlist')}
            className="cursor-pointer"
            title="View Saved Items"
          >
            <StatCard
              title="Saved in Wishlist"
              value={loading ? '...' : stats.wishlistItems}
              change="Active alerts"
              icon={Heart}
              color="amber"
              chartData={[]}
            />
          </div>

          <div
            onClick={() => navigate('/dashboard/user/products')}
            className="cursor-pointer"
            title="Browse Produce Catalog"
          >
            <StatCard
              title="Available Produce"
              value={loading ? '...' : stats.recentlyViewed}
              change="Fresh crops"
              icon={Eye}
              color="purple"
              chartData={[]}
            />
          </div>
        </div>

        {/* Featured Categories */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Explore Crop Categories</span>
            </h3>
            <Link
              to="/dashboard/user/products"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              View catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.length === 0 && !loading && (
              <div className="col-span-full py-6 text-center text-slate-500 text-sm">
                No categories available at the moment.
              </div>
            )}
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                onClick={() => navigate('/dashboard/user/products')}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 h-40 shadow-subtle hover:shadow-elevated cursor-pointer border border-slate-200/60"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {cat.count}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold font-display text-white group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommended Fresh Produce */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Recommended Farm Fresh Produce 🌾
            </h3>
            <Link
              to="/dashboard/user/products"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              All products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.length === 0 && !loading && (
              <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                No recommended produce at this time. Check back later!
              </div>
            )}
            {products.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="relative h-44 overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => navigate('/dashboard/user/products')}
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-subtle">
                      {prod.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4
                      className="font-bold text-slate-900 text-sm line-clamp-1 cursor-pointer hover:text-emerald-700 transition-colors"
                      onClick={() => navigate('/dashboard/user/products')}
                    >
                      {prod.name}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      👨‍🌾 {prod.farmerName}
                    </p>

                    <div className="flex items-center gap-1.5 text-amber-500 text-xs pt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-800">{prod.rating}</span>
                      <span className="text-slate-400 text-[10px]">({prod.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-base sm:text-lg font-black font-display text-slate-900">
                      ₹{prod.price}
                    </span>
                    <span className="text-[11px] text-slate-400"> / {prod.unit}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddToCartProduct(prod)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Orders History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Recent Orders & Deliveries</span>
            </h3>
            <Link
              to="/dashboard/user/orders"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View all orders &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {orders.length === 0 && !loading && (
              <div className="py-6 text-center text-slate-500 text-sm">
                No recent orders found. Start shopping fresh produce!
              </div>
            )}
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => navigate('/dashboard/user/orders')}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group"
                title="View order details"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    📦
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {ord.item}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ID: <strong>{ord.id}</strong> • Farm: {ord.farmer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-sm font-bold font-display text-slate-900">
                    ₹{ord.amount}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
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
}
