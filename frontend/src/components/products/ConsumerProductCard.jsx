import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Eye, Tractor, CheckCircle, ShieldCheck } from 'lucide-react';

const ConsumerProductCard = ({ product, onViewDetails, onAddToCart }) => {
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

  const farmerName = product.farmer?.name || 'Local Verified Farmer';
  const isInStock = product.quantity > 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Produce Image Container */}
        <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onViewDetails(product)}>
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Category Tag */}
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
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-2">
          {/* Farmer Badge */}
          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-semibold">
            <Tractor className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">{farmerName}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" title="Verified Farm Producer" />
          </div>

          {/* Produce Name */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-slate-800 text-base line-clamp-1 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 text-amber-500 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold text-slate-800">4.8</span>
            <span className="text-slate-400 text-[10px]">(Direct Harvest)</span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-0.5">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Footer Price & Actions */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
        <div>
          <span className="text-xl font-black text-slate-900">₹{product.price}</span>
          <span className="text-xs text-slate-400 font-semibold"> / {product.unit}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(product)}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 transition-colors"
            title="Inspect Produce Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onAddToCart(product)}
            disabled={!isInStock}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsumerProductCard;
