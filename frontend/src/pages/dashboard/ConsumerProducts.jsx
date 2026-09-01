import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import ConsumerProductCard from '../../components/products/ConsumerProductCard';
import ProductDetailsModal from '../../components/products/ProductDetailsModal';
import { getAllProductsApi } from '../../api/productApi';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sprout,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Grains',
  'Organic',
  'Dairy',
  'Spices',
  'Seeds',
  'Other',
];

const ConsumerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Query state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortOption, currentPage]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchTerm ? searchTerm.trim() : undefined,
        sort: sortOption,
        page: currentPage,
        limit: 12,
      };

      const res = await getAllProductsApi(params);
      setProducts(res.products || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Error fetching marketplace products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectProduct = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleAddToCart = (product) => {
    const qty = product.selectedQuantity || 1;
    toast.success(`Added ${qty} ${product.unit || 'unit'} of "${product.name}" to cart!`, {
      icon: '🛒',
    });
  };

  return (
    <DashboardLayout title="Fresh Produce Marketplace">
      <div className="space-y-8">
        {/* Marketplace Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-800/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="bg-emerald-400/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center space-x-1.5 w-max">
                <Sprout className="w-3.5 h-3.5" />
                <span>Direct Farmer to Consumer Marketplace</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Farm-Fresh Agricultural Produce 🌾
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Browse organic vegetables, fruits, and grains directly from verified local farmers. 100% transparent pricing and guaranteed fresh delivery.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs font-bold">
              <div className="text-center">
                <span className="text-xl font-black text-white">{totalCount}</span>
                <span className="block text-[10px] text-emerald-200 uppercase tracking-wider">Produce Items</span>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <span className="text-xl font-black text-amber-300">0%</span>
                <span className="block text-[10px] text-emerald-200 uppercase tracking-wider">Middlemen</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tomatoes, mangoes, rice..."
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Sort Dropdown & Counter */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Sort By:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="latest">Latest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Popularity / Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Produce Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ConsumerProductCard
                  key={product._id}
                  product={product}
                  onViewDetails={handleInspectProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs text-slate-500">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total produce items)
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No Produce Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No agricultural produce matches your current search term or category filter. Try clearing filters.
              </p>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setCurrentPage(1);
              }}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </DashboardLayout>
  );
};

export default ConsumerProducts;
