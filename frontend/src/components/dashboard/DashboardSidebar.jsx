import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sprout,
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Bot,
  User,
  Settings,
  Users,
  Tractor,
  CreditCard,
  FileText,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

const DashboardSidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Role-based Navigation Configuration
  const getNavLinks = () => {
    switch (user?.role) {
      case 'farmer':
        return [
          { name: 'Dashboard', path: '/dashboard/farmer', icon: LayoutDashboard },
          { name: 'Products', path: '/dashboard/farmer/products', icon: Package },
          { name: 'Orders', path: '/dashboard/farmer/orders', icon: ShoppingBag },
          { name: 'Analytics', path: '/dashboard/farmer/analytics', icon: BarChart3 },
          {
            name: 'AI Assistant',
            path: '/dashboard/farmer/ai-assistant',
            icon: Bot,
            badge: 'AI',
          },
          { name: 'Profile', path: '/dashboard/farmer/profile', icon: User },
          { name: 'Settings', path: '/dashboard/farmer/settings', icon: Settings },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
          { name: 'Users', path: '/dashboard/admin/users', icon: Users },
          { name: 'Farmers', path: '/dashboard/admin/farmers', icon: Tractor },
          { name: 'Products', path: '/dashboard/admin/products', icon: Package },
          { name: 'Orders', path: '/dashboard/admin/orders', icon: ShoppingBag },
          { name: 'Payments', path: '/dashboard/admin/payments', icon: CreditCard },
          { name: 'Reports', path: '/dashboard/admin/reports', icon: FileText },
          { name: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
        ];
      default: // consumer / user
        return [
          { name: 'Dashboard', path: '/dashboard/user', icon: LayoutDashboard },
          { name: 'Browse Products', path: '/dashboard/user/products', icon: Package },
          { name: 'Cart', path: '/dashboard/user/cart', icon: ShoppingCart },
          { name: 'Orders', path: '/dashboard/user/orders', icon: ShoppingBag },
          { name: 'Wishlist', path: '/dashboard/user/wishlist', icon: Heart },
          { name: 'Profile', path: '/dashboard/user/profile', icon: User },
          { name: 'Settings', path: '/dashboard/user/settings', icon: Settings },
        ];
    }
  };

  const navLinks = getNavLinks();

  const getRoleHeaderBadge = () => {
    switch (user?.role) {
      case 'farmer':
        return { text: 'Farmer Hub', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'admin':
        return { text: 'Admin Console', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { text: 'Consumer Portal', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const badgeInfo = getRoleHeaderBadge();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-wide">FarmEasy</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border w-max ${badgeInfo.bg}`}>
                  {badgeInfo.text}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white items-center justify-center hover:bg-slate-700 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={closeMobile}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard/farmer' &&
                item.path !== '/dashboard/user' &&
                item.path !== '/dashboard/admin' &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isMobileOpen && closeMobile()}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title={isCollapsed && !isMobileOpen ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}

                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>{item.badge}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer User Info */}
      {(!isCollapsed || isMobileOpen) && user && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-emerald-500"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">{user.name}</span>
              <span className="text-[11px] text-slate-400 capitalize">{user.role} Account</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
          ></div>
          <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
