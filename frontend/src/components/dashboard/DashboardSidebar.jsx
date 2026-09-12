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

export default function DashboardSidebar({
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}) {
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart || { totalItems: 0 });
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
            name: 'AI Advisory',
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
      default: // consumer
        return [
          { name: 'Dashboard', path: '/dashboard/user', icon: LayoutDashboard },
          { name: 'Browse Crops', path: '/dashboard/user/products', icon: Package },
          {
            name: 'Cart',
            path: '/dashboard/user/cart',
            icon: ShoppingCart,
            countBadge: totalItems > 0 ? totalItems : null,
          },
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
        return { text: 'Farmer Hub', bg: 'bg-amber-400/10 text-amber-300 border-amber-400/30' };
      case 'admin':
        return { text: 'Platform Console', bg: 'bg-purple-400/10 text-purple-300 border-purple-400/30' };
      default:
        return { text: 'Consumer Hub', bg: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30' };
    }
  };

  const badgeInfo = getRoleHeaderBadge();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#08170e] text-slate-300 border-r border-emerald-950/80 select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-emerald-950/80">
          <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="text-base font-bold font-display text-white tracking-tight">
                  FarmEasy
                </span>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border w-max ${badgeInfo.bg}`}
                >
                  {badgeInfo.text}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg bg-emerald-950/60 text-slate-400 hover:text-white items-center justify-center hover:bg-emerald-900/60 border border-emerald-900/40 transition-colors"
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
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-emerald-900/40 text-emerald-300 font-bold border border-emerald-700/40'
                    : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
                }`}
                title={isCollapsed && !isMobileOpen ? item.name : undefined}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full" />
                )}

                <div className="relative shrink-0">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {isCollapsed && !isMobileOpen && item.countBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.countBadge}
                    </span>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}

                {(!isCollapsed || isMobileOpen) && item.countBadge && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.countBadge}
                  </span>
                )}

                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
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
        <div className="p-3 border-t border-emerald-950/80 bg-emerald-950/20">
          <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-emerald-950/40 transition-colors">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-emerald-500"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">{user.name}</span>
              <span className="text-[10px] text-emerald-400 capitalize">{user.role} Member</span>
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
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
