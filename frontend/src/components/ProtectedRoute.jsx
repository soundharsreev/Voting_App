import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const isAuthorized = user.role === role || (role === 'admin' && user.role === 'superadmin');
    if (!isAuthorized) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
