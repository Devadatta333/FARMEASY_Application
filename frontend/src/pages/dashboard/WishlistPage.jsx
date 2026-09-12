import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { fetchWishlist, toggleWishlistItem } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  Tractor,
  Eye,
  ShieldCheck,
  Star,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    const url = typeof img === 'string' ? img : img.url;
    if (url.startsWith('/uploads')) {
      return `http://localhost:3333${url}`;
    }
    return url;
  };

  const handleRemoveFromWishlist = (product) => {
    dispatch(toggleWishlistItem(product));
    toast.success(`Removed "${product.name}" from wishlist`);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`Added "${product.name}" to cart! 🛒`);
  };

  return (
    <DashboardLayout title="My Saved Wishlist">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              <span>Saved Farm Produce</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your favorite crops and farm items saved for later quick purchase
            </p>
          </div>

          {items.length > 0 && (
            <span className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
              {items.length} Saved Item{items.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs text-slate-500 font-semibold">Loading your saved items...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((product) => {
                const primaryImage = product.images && product.images.length > 0
                  ? getImageUrl(product.images[0])
                  : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

                const farmerName = product.farmer?.name || 'Local Verified Farmer';
                const isInStock = product.quantity > 0;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Image Container */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Category Tag */}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                          {product.category}
                        </span>

                        {/* Remove Button Overlay */}
                        <button
                          onClick={() => handleRemoveFromWishlist(product)}
                          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-full backdrop-blur-md shadow-md transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-semibold">
                          <Tractor className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="truncate">{farmerName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        </div>

                        <h3 className="font-bold text-slate-800 text-base line-clamp-1">
                          {product.name}
                        </h3>

                        <div className="flex items-center space-x-1 text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold text-slate-800">4.8</span>
                          <span className="text-slate-400 text-[10px]">(Direct Harvest)</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <div>
                        <span className="text-xl font-black text-slate-900">₹{product.price}</span>
                        <span className="text-xs text-slate-400 font-semibold"> / {product.unit}</span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!isInStock}
                        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-md text-center space-y-5 max-w-md mx-auto my-12">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                No saved products yet. Explore the marketplace and save products you like for quick direct ordering.
              </p>
            </div>

            <Link
              to="/dashboard/user/products"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Farm Produce</span>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WishlistPage;
