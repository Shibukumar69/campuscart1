import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuscart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campuscart_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUserSession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            const userData = { ...res.data.data.user, shop: res.data.data.shop };
            setUser(userData);
            localStorage.setItem('campuscart_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.warn('[Auth] Session check failed, clearing token');
          localStorage.removeItem('campuscart_token');
          localStorage.removeItem('campuscart_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, shop, accessToken } = res.data.data;
      const combined = { ...userData, shop };
      setUser(combined);
      setToken(accessToken);
      localStorage.setItem('campuscart_token', accessToken);
      localStorage.setItem('campuscart_user', JSON.stringify(combined));
      return combined;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    if (res.data.success) {
      const { user: userData, shop, accessToken } = res.data.data;
      const combined = { ...userData, shop };
      setUser(combined);
      setToken(accessToken);
      localStorage.setItem('campuscart_token', accessToken);
      localStorage.setItem('campuscart_user', JSON.stringify(combined));
      return combined;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('campuscart_token');
    localStorage.removeItem('campuscart_user');
  };

  // Instant 1-click demo login for demonstration & testing
  const demoLogin = async (role) => {
    let email = 'student@campuscart.edu';
    if (role === 'SHOP_OWNER') email = 'vendor@campuscart.edu';
    if (role === 'DELIVERY_AGENT') email = 'delivery@campuscart.edu';
    if (role === 'ADMIN') email = 'admin@campuscart.edu';

    return login(email, 'Campus@123');
  };

  const loginWithOtp = async (email, otp) => {
    const res = await api.post('/auth/login-otp', { email, otp });
    if (res.data.success) {
      const { user: userData, shop, accessToken } = res.data.data;
      const combined = { ...userData, shop };
      setUser(combined);
      setToken(accessToken);
      localStorage.setItem('campuscart_token', accessToken);
      localStorage.setItem('campuscart_user', JSON.stringify(combined));
      return combined;
    }
    throw new Error(res.data.message || 'OTP Login failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        loginWithOtp,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
