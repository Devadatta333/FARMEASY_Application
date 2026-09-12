import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Truck, ArrowRight, ShoppingBag, Calendar, MapPin } from 'lucide-react';

const OrderSuccessModal = ({ isOpen, order, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  // Format delivery date (2-3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleViewOrders = () => {
    onClose();
    navigate('/dashboard/user/orders');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/dashboard/user/products');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        ></motion.div>

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 my-8 overflow-hidden"
        >
          {/* Animated Top Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30"
            >
              <CheckCircle className="w-12 h-12" />
            </motion.div>

            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Order Confirmed 🎉
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Thank You for Your Order!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your direct farm produce order has been sent to the farmer.
              </p>
            </div>

            {/* Order Card Detail */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold">Order ID:</span>
                <span className="font-mono font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                  {order.orderNumber || order._id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Total Amount:</span>
                <span className="font-black text-emerald-700 text-sm">
                  ₹{order.totalAmount}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    ({order.paymentMethod} - {order.paymentStatus})
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Est. Delivery:</span>
                </span>
                <span className="font-bold text-slate-800">{formattedDelivery}</span>
              </div>

              {order.shippingAddress && (
                <div className="flex items-start space-x-1.5 pt-1 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    {order.shippingAddress.streetAddress}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleViewOrders}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Track Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleContinueShopping}
                className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderSuccessModal;
