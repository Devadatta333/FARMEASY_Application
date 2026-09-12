import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  getMyOrdersApi,
  getFarmerOrdersApi,
  getAllOrdersApi,
  updateOrderStatusApi,
  cancelOrderApi,
} from '../../api/orderApi';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Loader2,
  Filter,
  Search,
  ChevronRight,
  X,
  AlertCircle,
  Tractor,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'farmer') {
        res = await getFarmerOrdersApi();
      } else if (user?.role === 'admin') {
        res = await getAllOrdersApi();
      } else {
        res = await getMyOrdersApi();
      }
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Fetch Orders Error:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await updateOrderStatusApi(orderId, { orderStatus: newStatus });
      toast.success(res.message || `Order status updated to "${newStatus}"`);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.order);
      }
      fetchOrders();
    } catch (err) {
      console.error('Update Status Error:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setStatusUpdating(true);
    try {
      const res = await cancelOrderApi(selectedOrder._id, { reason: cancelReason });
      toast.success(res.message || 'Order cancelled successfully');
      setShowCancelModal(false);
      setSelectedOrder(res.order);
      fetchOrders();
    } catch (err) {
      console.error('Cancel Order Error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    if (img.startsWith('/uploads')) {
      return `http://localhost:3333${img}`;
    }
    return img;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return { label: 'Pending', icon: Clock, bg: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'Confirmed':
        return { label: 'Confirmed', icon: CheckCircle2, bg: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'Processing':
        return { label: 'Processing', icon: Tractor, bg: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'Shipped':
        return { label: 'Shipped', icon: Truck, bg: 'bg-indigo-50 text-indigo-800 border-indigo-300' };
      case 'Delivered':
        return { label: 'Delivered', icon: PackageCheck, bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'Cancelled':
        return { label: 'Cancelled', icon: XCircle, bg: 'bg-red-50 text-red-800 border-red-300' };
      default:
        return { label: status, icon: Clock, bg: 'bg-slate-50 text-slate-800 border-slate-300' };
    }
  };

  const statusSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'All' || order.orderStatus === selectedStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderItems.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout title="Order Management">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <ShoppingBag className="w-7 h-7 text-emerald-600" />
              <span>
                {user?.role === 'farmer'
                  ? 'Produce Sales Orders'
                  : user?.role === 'admin'
                  ? 'All System Orders'
                  : 'My Crop Orders'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {user?.role === 'farmer'
                ? 'Track and manage customer orders for your farm produce'
                : 'Track harvest delivery progress and order receipts'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order number or item..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
          {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs text-slate-500 font-semibold">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.orderStatus);
              const StatusIcon = statusBadge.icon;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-md hover:shadow-lg transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">| {formattedDate}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadge.bg}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusBadge.label}</span>
                      </span>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2 space-y-2">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                          />
                          <div className="space-y-0.5 truncate">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Qty: {item.quantity} {item.unit} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Price & Quick Action */}
                    <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          {user?.role === 'farmer' ? 'Produce Revenue' : 'Total Amount'}
                        </span>
                        <span className="text-xl font-black text-emerald-700">₹{order.totalAmount}</span>
                      </div>

                      {/* Farmer Quick Status Update Selector */}
                      {(user?.role === 'farmer' || user?.role === 'admin') && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={statusUpdating}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirm Order</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Mark Shipped</option>
                          <option value="Delivered">Mark Delivered</option>
                        </select>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-md text-center space-y-5 max-w-md mx-auto my-12">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {user?.role === 'farmer' ? 'No Customer Orders Yet' : 'No Orders Placed Yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {user?.role === 'farmer'
                  ? 'When consumers purchase your listed farm produce, customer orders will appear here.'
                  : "You haven't placed any orders yet. Browse our farm marketplace to get started."}
              </p>
            </div>

            {user?.role !== 'farmer' && (
              <Link
                to="/dashboard/user/products"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Farm Produce</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-800 to-forest-800 text-white shrink-0">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center space-x-2">
                  <span>Order Details #{selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-emerald-200">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Order Status Progress Stepper */}
              {selectedOrder.orderStatus !== 'Cancelled' ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Delivery Tracker Progress:</span>
                  <div className="flex items-center justify-between relative">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = statusSteps.indexOf(selectedOrder.orderStatus);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className="flex flex-col items-center z-10 space-y-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              isCurrent ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>Order was Cancelled ({selectedOrder.cancellationReason || 'No reason specified'})</span>
                </div>
              )}

              {/* Produce Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ordered Produce</h4>
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  {selectedOrder.orderItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{item.name}</h5>
                          <p className="text-[11px] text-slate-500">
                            {item.quantity} {item.unit} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address & Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-extrabold text-slate-800 flex items-center space-x-1.5 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Shipping Address</span>
                  </span>
                  <p className="font-bold text-slate-700">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-slate-600">{selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-slate-600">{selectedOrder.shippingAddress?.streetAddress}</p>
                  <p className="text-slate-600">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-extrabold text-slate-800 flex items-center space-x-1.5 mb-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Payment Information</span>
                  </span>
                  <p className="text-slate-600">
                    Method: <span className="font-bold text-slate-800">{selectedOrder.paymentMethod}</span>
                  </p>
                  <p className="text-slate-600">
                    Status: <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span>
                  </p>
                  <p className="text-slate-600 pt-1">
                    Total Amount: <span className="font-black text-emerald-700 text-sm">₹{selectedOrder.totalAmount}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  Cancel Order
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form onSubmit={handleCancelOrder} className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Cancel Order #{selectedOrder.orderNumber}?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel this order? Stock quantities will be automatically restored to the farmer's inventory.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Reason for cancellation (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Reason..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={statusUpdating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {statusUpdating ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrdersPage;
