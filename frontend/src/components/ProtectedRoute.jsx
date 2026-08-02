import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
