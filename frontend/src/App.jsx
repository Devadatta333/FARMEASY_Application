import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { Toaster } from 'react-hot-toast';

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
import AdminDashboard from './pages/dashboard/AdminDashboard';
import PlaceholderModule from './pages/dashboard/PlaceholderModule';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

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
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />

      {/* Render Public Top Navbar only when not in dashboard */}
      {!isDashboardRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes (Accessible only when logged out) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* General Protected Dashboard Redirect Root */}
          <Route element={<ProtectedRoute allowedRoles={['farmer', 'consumer', 'user', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>

          {/* Farmer Specific Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
            <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
            <Route path="/dashboard/farmer/products" element={<FarmerProducts />} />
            <Route path="/dashboard/farmer/*" element={<PlaceholderModule />} />
          </Route>

          {/* Consumer Specific Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['consumer', 'user']} />}>
            <Route path="/dashboard/user" element={<ConsumerDashboard />} />
            <Route path="/dashboard/consumer" element={<ConsumerDashboard />} />
            <Route path="/dashboard/user/products" element={<ConsumerProducts />} />
            <Route path="/dashboard/consumer/products" element={<ConsumerProducts />} />
            <Route path="/dashboard/user/*" element={<PlaceholderModule />} />
            <Route path="/dashboard/consumer/*" element={<PlaceholderModule />} />
          </Route>

          {/* Admin Specific Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/*" element={<PlaceholderModule />} />
          </Route>

          {/* Root Path Redirect */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />

          {/* Error Pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Render Public Footer only when not in dashboard */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
