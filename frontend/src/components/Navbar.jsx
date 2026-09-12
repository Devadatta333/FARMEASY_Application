import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Sprout, LogOut, User as UserIcon, Shield, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Button } from './ui';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'farmer':
        return (
          <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
            🌾 Farmer
          </span>
        );
      case 'admin':
        return (
          <span className="bg-purple-50 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
            ⚡ Admin
          </span>
        );
      default:
        return (
          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            🛒 Buyer
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Sprout className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-slate-900 tracking-tight">
              FarmEasy
            </span>
            <span className="hidden sm:inline-block text-[9px] uppercase font-bold text-emerald-800 tracking-wider ml-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Direct Agronomic Hub
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />}
                >
                  Dashboard
                </Button>
              </Link>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 pl-2 pr-2.5 py-1 rounded-full">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 hidden md:block">
                  {user.name}
                </span>
                {getRoleBadge(user.role)}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
