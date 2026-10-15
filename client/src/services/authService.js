// src/services/authService.js
import { api } from './api';

export const authService = {
  registerCustomer: (data) => api.post('/auth/customer/register', data),
  loginCustomer:    (data) => api.post('/auth/customer/login', data),
  registerOwner: (data) => api.post('/auth/owner/register', data),
  loginOwner:    (data) => api.post('/auth/owner/login', data),
  loginAdmin:    (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  me:      () => api.get('/auth/me'),
  verifyEmail:       (token) => api.get(`/auth/verify-email?token=${token}`),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  resendVerification:(email) => api.post('/auth/resend-verification', { email }),
  logout: () => api.post('/auth/logout'),
  me:      () => api.get('/auth/me'),
};