import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set base backend API URL (configure relative for render deployment or local port 5000)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Configure default axios headers
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Verify token/fetch profile on page load
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users/profile`);
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/users/profile`, profileData);
      if (res.data.success) {
        setUser(res.data.data);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed.'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, API_URL, login, register, logout, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
