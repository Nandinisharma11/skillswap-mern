import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0e17',
        color: '#f8fafc'
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          borderLeftColor: '#6366f1',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Banned check
  if (user.isBanned) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card text-center" style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '20px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Your account has been banned due to a violation of platform guidelines. Please contact administration.
          </p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
