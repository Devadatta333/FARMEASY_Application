import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { Menu, Bell, LogOut, Search, ShoppingCart, User as UserIcon, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardNavbar = ({ onOpenMobileSidebar, title = 'Dashboard' }) => {
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart || { totalItems: 0 });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!navSearchQuery.trim()) return;

    const term = navSearchQuery.trim();
    if (user?.role === 'farmer') {
      navigate(`/dashboard/farmer/products?search=${encodeURIComponent(term)}`);
    } else {
      navigate(`/dashboard/user/products?search=${encodeURIComponent(term)}`);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'farmer':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">🌾 Farmer</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-300">⚡ Admin</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">🛒 Consumer</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            FarmEasy Direct Agricultural Marketplace
          </p>
        </div>
      </div>

      {/* Right: Search, Cart, Notifications & User Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Search Input Engine */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-slate-100/80 border border-slate-200/80 rounded-xl px-3 py-1.5 w-64 text-slate-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={navSearchQuery}
            onChange={(e) => setNavSearchQuery(e.target.value)}
            placeholder="Search products, crops..."
            className="bg-transparent text-xs text-slate-700 focus:outline-none w-full"
          />
        </form>

        {/* Shopping Cart Shortcut for Consumers */}
        {user?.role !== 'farmer' && (
          <button
            onClick={() => navigate('/dashboard/user/cart')}
            className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        )}

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">2 New</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <p className="font-semibold text-emerald-950">Welcome to FarmEasy!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Your authenticated session is active.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-800">System Ready</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Shopping Cart & Search Engine loaded.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        {user && (
          <div className="flex items-center space-x-3 bg-slate-100/80 border border-slate-200/80 pl-2 pr-3 py-1.5 rounded-2xl">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-500"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col text-left hidden sm:flex">
              <span className="text-xs font-bold text-slate-800 leading-none">{user.name}</span>
              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default DashboardNavbar;
