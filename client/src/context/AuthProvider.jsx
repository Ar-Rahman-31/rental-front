// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await authService.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  const login = async (fn, credentials) => {
    const { data } = await fn(credentials);
    setUser(data.user);
    setAccessToken(data.accessToken);
    // make token available for socket.io client
    window.__DRIVEEASE_ACCESS_TOKEN__ = data.accessToken;
    toast.success('Welcome back!');
  };

  const register = async (fn, payload) => {
    await fn(payload);
    toast.success('Registration successful – please verify your e‑mail.');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
    window.__DRIVEEASE_ACCESS_TOKEN__ = null;
    toast.info('You have been logged out');
  };

  const resendVerification = async (email) => {
    await authService.resendVerification(email);
    toast.success('Verification e‑mail sent');
  };

  const resendOtp = async (email) => {
    await authService.resendOtp(email);
    toast.success('New OTP sent');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refresh: fetchMe,
    resendVerification,
    resendOtp,
    accessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};