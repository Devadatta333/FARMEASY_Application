import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Minus, Tag, PackageCheck, AlertTriangle } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, onUpdateStock }) => {
  const [stockLoading, setStockLoading] = useState(false);

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    const url = typeof img === 'string' ? img : img.url;
    if (url.startsWith('/uploads')) {
      return `http://localhost:3333${url}`;
    }
    return url;
  };

  const primaryImage = product.images && product.images.length > 0
    ? getImageUrl(product.images[0])
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  const isInStock = product.quantity > 0;

  const handleStockChange = async (delta) => {
    const newQty = Math.max(0, product.quantity + delta);
    setStockLoading(true);
    await onUpdateStock(product._id, newQty);
    setStockLoading(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
            {product.category}
          </span>

          {/* Stock Status Badge */}
          <span
            className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs border ${
              isInStock
                ? 'bg-emerald-500/90 text-white border-emerald-400'
                : 'bg-red-500/90 text-white border-red-400'
            }`}
          >
            {isInStock ? `In Stock (${product.quantity})` : 'Out of Stock'}
          </span>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-800 text-base line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-baseline space-x-1 pt-1">
            <span className="text-xl font-black text-slate-900">₹{product.price}</span>
            <span className="text-xs text-slate-400 font-semibold"> / {product.unit}</span>
          </div>
        </div>
      </div>

      {/* Inventory & Actions Bar */}
      <div className="p-5 pt-0 space-y-3">
        {/* Quick Inventory Controls */}
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Stock Quantity:
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStockChange(-1)}
              disabled={stockLoading || product.quantity <= 0}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 transition-colors"
              title="Decrease Stock"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-bold text-slate-800 min-w-[2rem] text-center">
              {product.quantity} {product.unit}
            </span>

            <button
              onClick={() => handleStockChange(1)}
              disabled={stockLoading}
              className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center disabled:opacity-40 transition-colors shadow-xs"
              title="Increase Stock"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Produce</span>
          </button>

          <button
            onClick={() => onDelete(product)}
            className="flex items-center justify-center p-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
