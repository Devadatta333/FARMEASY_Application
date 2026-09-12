import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from '../../redux/slices/cartSlice';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import CheckoutModal from '../../components/dashboard/CheckoutModal';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { items, farmerName, totalItems, subtotal, deliveryFee, total } = useSelector(
    (state) => state.cart
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    const url = typeof img === 'string' ? img : img.url;
    if (url.startsWith('/uploads')) {
      return `http://localhost:3333${url}`;
    }
    return url;
  };

  const handleQuantityChange = (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      dispatch(removeFromCart(id));
      toast.success('Item removed from cart');
    } else {
      dispatch(updateCartQuantity({ id, quantity: newQty }));
    }
  };

  const handleRemoveItem = (id, name) => {
    dispatch(removeFromCart(id));
    toast.success(`Removed "${name}" from cart`);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your shopping cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <DashboardLayout title="My Shopping Cart">
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <div className="space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <ShoppingCart className="w-7 h-7 text-emerald-600" />
              <span>Direct Produce Shopping Cart</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review fresh produce from local farmers before placing your direct order
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl border border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Farmer Header Badge */}
        {items.length > 0 && (
          <div className="p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                👨‍🌾
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Single-Farmer Order</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {farmerName || items[0]?.farmerName || 'Verified Local Farmer'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200">
              Direct Farm Shipment 🚚
            </span>
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items List (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Thumbnail */}
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                      />

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">
                          👨‍🌾 {item.farmerName}
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          ₹{item.price} <span className="text-slate-400 font-normal">/ {item.unit}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Incrementor */}
                      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-2 min-w-[2rem] text-center">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id, item.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Delivery Assurance Pill */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center space-x-3 text-xs text-emerald-800 font-semibold">
                <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  All orders are sourced fresh from farms and delivered in eco-friendly protective packaging.
                </span>
              </div>
            </div>

            {/* Right: Order Summary Sidebar (1 col) */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6 sticky top-24">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-bold text-slate-900">₹{subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Estimated Farm Delivery</span>
                    <span className="font-bold text-emerald-600">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {subtotal < 1000 && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60 space-y-1">
                      <p className="font-bold flex items-center justify-between">
                        <span>💡 Delivery Tier:</span>
                        <span className="text-emerald-700 font-extrabold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Add <strong>₹{1000 - subtotal}</strong> more produce to unlock <strong>FREE Delivery</strong>! (Free above ₹1000)
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Platform Service Fee</span>
                    <span className="font-bold text-emerald-600">₹0 (Zero Commission)</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-slate-900">
                    <span className="text-sm font-black">Total Payable</span>
                    <span className="text-2xl font-black text-emerald-700">₹{total}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/dashboard/user/products"
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-md text-center space-y-5 max-w-md mx-auto my-12">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingCart className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You haven't added any fresh produce items to your shopping cart yet. Browse our farm marketplace to get started.
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

export default CartPage;
