import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../redux/slices/cartSlice';
import { createOrderApi } from '../../api/orderApi';
import PaymentSimulator from './PaymentSimulator';
import OrderSuccessModal from './OrderSuccessModal';
import {
  X,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Banknote,
  QrCode,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const { items, subtotal, deliveryFee, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isPaymentSimulating, setIsPaymentSimulating] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: user?.address?.streetAddress || user?.location || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        streetAddress: prev.streetAddress || user.address?.streetAddress || user.location || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || '',
        pincode: prev.pincode || user.address?.pincode || '',
      }));
    }
  }, [user]);

  if (!isOpen && !isSuccessModalOpen && !isPaymentSimulating) return null;

  const executeOrderCreation = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: items.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
        })),
        shippingAddress,
        paymentMethod,
      };

      const res = await createOrderApi(orderData);
      if (res.success && res.order) {
        dispatch(clearCart());
        setCompletedOrder(res.order);
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      setIsPaymentSimulating(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!items || items.length === 0) {
      toast.error('Your shopping cart is empty');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.pincode) {
      toast.error('Please complete all shipping address fields');
      return;
    }

    // If payment method is digital (UPI, Card, NetBanking), trigger payment simulator first
    if (paymentMethod !== 'COD') {
      setIsPaymentSimulating(true);
    } else {
      executeOrderCreation();
    }
  };

  return (
    <>
      {/* Payment Simulator Layer */}
      <PaymentSimulator
        isOpen={isPaymentSimulating}
        paymentMethod={paymentMethod}
        amount={total}
        onSuccess={executeOrderCreation}
        onCancel={() => setIsPaymentSimulating(false)}
      />

      {/* Order Success Modal Layer */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        order={completedOrder}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setCompletedOrder(null);
          onClose();
        }}
      />

      {/* Main Checkout Modal */}
      {isOpen && !isSuccessModalOpen && !isPaymentSimulating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-800 to-forest-800 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Direct Farm Order Checkout</h3>
                  <p className="text-xs text-emerald-200">Fresh harvest shipped directly to your doorstep</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Shipping Address Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Delivery Shipping Address</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Full Receiver Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Receiver's name"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Contact Phone *</label>
                    <input
                      type="text"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Street Address / House No. *</label>
                    <input
                      type="text"
                      value={shippingAddress.streetAddress}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="House number, street name, landmark"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">City / District *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Anand"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Gujarat"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Postal Pincode *</label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. 388001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Select Payment Option</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px]">Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-purple-600" />
                    <span className="text-[11px]">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-[11px]">Debit/Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'NetBanking'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span className="text-[11px]">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Order Totals Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Produce Subtotal ({items.length} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Farm Delivery Fee</span>
                  <span className="font-bold text-emerald-600">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-slate-900">
                  <span className="font-black text-sm">Total Payable Amount</span>
                  <span className="text-xl font-black text-emerald-700">₹{total}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-7 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{paymentMethod === 'COD' ? 'Confirm & Place Order' : 'Proceed to Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutModal;
