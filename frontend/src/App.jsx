import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import DashboardRedirect from './pages/dashboard/DashboardRedirect';
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import FarmerProducts from './pages/dashboard/FarmerProducts';
import ConsumerDashboard from './pages/dashboard/ConsumerDashboard';
import ConsumerProducts from './pages/dashboard/ConsumerProducts';
import CartPage from './pages/dashboard/CartPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfilePage from './pages/dashboard/ProfilePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import WishlistPage from './pages/dashboard/WishlistPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import PlaceholderModule from './pages/dashboard/PlaceholderModule';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcf8] selection:bg-emerald-600 selection:text-white antialiased font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#07170e',
            color: '#f1f5f9',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#07170e',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#07170e',
            },
          },
        }}
      />

      {/* Render Public Top Navbar only when not in dashboard */}
      {!isDashboardRoute && <Navbar />}

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
              <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
            </Route>

            {/* General Protected Dashboard Root & Common Module Shortcuts */}
            <Route element={<ProtectedRoute allowedRoles={['farmer', 'consumer', 'user', 'admin']} />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/dashboard/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/dashboard/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
              <Route path="/dashboard/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
              <Route path="/dashboard/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
              <Route path="/dashboard/products" element={<PageWrapper><ConsumerProducts /></PageWrapper>} />
              <Route path="/dashboard/crops" element={<PageWrapper><ConsumerProducts /></PageWrapper>} />
              <Route path="/dashboard/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
            </Route>

            {/* Farmer Specific Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
              <Route path="/dashboard/farmer" element={<PageWrapper><FarmerDashboard /></PageWrapper>} />
              <Route path="/dashboard/farmer/products" element={<PageWrapper><FarmerProducts /></PageWrapper>} />
              <Route path="/dashboard/farmer/browse-crops" element={<PageWrapper><ConsumerProducts /></PageWrapper>} />
              <Route path="/dashboard/farmer/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
              <Route path="/dashboard/farmer/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
              <Route path="/dashboard/farmer/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/dashboard/farmer/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
              <Route path="/dashboard/farmer/*" element={<PageWrapper><PlaceholderModule /></PageWrapper>} />
            </Route>

            {/* Consumer Specific Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['consumer', 'user']} />}>
              <Route path="/dashboard/user" element={<PageWrapper><ConsumerDashboard /></PageWrapper>} />
              <Route path="/dashboard/consumer" element={<PageWrapper><ConsumerDashboard /></PageWrapper>} />
              <Route path="/dashboard/user/products" element={<PageWrapper><ConsumerProducts /></PageWrapper>} />
              <Route path="/dashboard/consumer/products" element={<PageWrapper><ConsumerProducts /></PageWrapper>} />
              <Route path="/dashboard/user/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
              <Route path="/dashboard/consumer/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
              <Route path="/dashboard/user/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
              <Route path="/dashboard/consumer/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
              <Route path="/dashboard/user/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
              <Route path="/dashboard/consumer/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
              <Route path="/dashboard/user/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/dashboard/consumer/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/dashboard/user/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
              <Route path="/dashboard/consumer/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
              <Route path="/dashboard/user/*" element={<PageWrapper><PlaceholderModule /></PageWrapper>} />
              <Route path="/dashboard/consumer/*" element={<PageWrapper><PlaceholderModule /></PageWrapper>} />
            </Route>

            {/* Admin Specific Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
              <Route path="/dashboard/admin/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
              <Route path="/dashboard/admin/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
              <Route path="/dashboard/admin/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
              <Route path="/dashboard/admin/*" element={<PageWrapper><PlaceholderModule /></PageWrapper>} />
            </Route>

            {/* Shortcuts for cart & products */}
            <Route path="/cart" element={<Navigate to="/dashboard/cart" replace />} />
            <Route path="/products" element={<Navigate to="/dashboard/products" replace />} />
            <Route path="/crops" element={<Navigate to="/dashboard/crops" replace />} />

            {/* Root Path Redirect */}
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
            />

            {/* Error Pages */}
            <Route path="/unauthorized" element={<PageWrapper><Unauthorized /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Render Public Footer only when not in dashboard */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
