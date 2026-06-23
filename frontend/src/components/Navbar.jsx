import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, MessageSquare, Shield, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <BookOpen size={24} style={{ stroke: 'url(#grad)' }} />
          <span>SkillSwap</span>
          {/* SVG gradient for logo icon */}
          <svg width="0" height="0">
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </svg>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {user.role === 'admin' ? (
                  <>
                    <Shield size={16} /> Admin Portal
                  </>
                ) : (
                  <>
                    <UserIcon size={16} /> Dashboard
                  </>
                )}
              </NavLink>
              
              {user.role !== 'admin' && (
                <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <MessageSquare size={16} /> Chat
                </NavLink>
              )}

              <div className="user-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  background: 'rgba(99, 102, 241, 0.2)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  color: 'var(--color-primary)'
                }}>{user.role}</span>
              </div>

              <button onClick={handleLogout} className="btn btn-outline btn-small" style={{ display: 'flex', gap: '6px' }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-small">Login</Link>
              <Link to="/register" className="btn btn-primary btn-small">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
