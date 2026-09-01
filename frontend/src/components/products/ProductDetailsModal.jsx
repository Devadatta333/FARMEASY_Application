import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Star,
  Tractor,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Plus,
  Minus,
  Truck,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailsModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    const url = typeof img === 'string' ? img : img.url;
    if (url.startsWith('/uploads')) {
      return `http://localhost:3333${url}`;
    }
    return url;
  };

  const images = product.images && product.images.length > 0
    ? product.images.map(getImageUrl)
    : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'];

  const primaryImage = images[selectedImageIndex] || images[0];
  const farmer = product.farmer || { name: 'Verified Local Farmer', location: 'India' };
  const isInStock = product.quantity > 0;

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, Math.min(product.quantity, orderQuantity + delta));
    setOrderQuantity(newQty);
  };

  const handleAdd = () => {
    onAddToCart({ ...product, selectedQuantity: orderQuantity });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 my-8 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-md">
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                  {product.category}
                </span>

                <span
                  className={`absolute top-4 right-4 text-xs font-extrabold px-3 py-1 rounded-full backdrop-blur-md shadow-xs border ${
                    isInStock
                      ? 'bg-emerald-500/90 text-white border-emerald-400'
                      : 'bg-red-500/90 text-white border-red-400'
                  }`}
                >
                  {isInStock ? `In Stock (${product.quantity} ${product.unit})` : 'Out of Stock'}
                </span>
              </div>

              {/* Thumbnails list if multiple images exist */}
              {images.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                  {images.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgSrc} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Produce Details & Farmer Card */}
            <div className="flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Farmer Info Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      🌾
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                        <span>{farmer.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{farmer.location || 'Direct Farm Producer'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    Direct Farmer
                  </span>
                </div>

                {/* Produce Name & Rating */}
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400 mr-1" />
                      <span>4.8</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Fresh Harvest
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Price & Unit */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">Price per Unit</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
                      <span className="text-xs font-bold text-slate-500"> / {product.unit}</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  {isInStock && (
                    <div className="flex items-center space-x-2 bg-white border border-slate-200 p-1.5 rounded-xl">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 px-2">
                        {orderQuantity} {product.unit}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Direct Express Farm Delivery Available</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                <button
                  onClick={handleAdd}
                  disabled={!isInStock}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add {orderQuantity} {product.unit} to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
