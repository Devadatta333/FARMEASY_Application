import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'farmer':
      return <Navigate to="/dashboard/farmer" replace />;
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'consumer':
    case 'user':
    default:
      return <Navigate to="/dashboard/user" replace />;
  }
};

export default DashboardRedirect;
