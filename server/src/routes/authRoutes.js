
import express from 'express';
import rateLimit from 'express-rate-limit';

import {
  register,
  login,
  getMe,
  logout,
  refresh,
  resendVerification,
  verifyEmail,
  verifyOtp,
  resendOtp,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

// Stricter limiter for login attempts (10 per 15 min)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.',
});

// Moderate limiter for token refresh / me endpoint (100 per 15 min)
const authApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

const router = express.Router();

// Customer authentication
router.post('/customer/register', (req, res, next) => {
  req.authRole = 'customer';
  next();
}, register);

router.post('/customer/login', loginLimiter, (req, res, next) => {
  req.authRole = 'customer';
  next();
}, login);

// Owner authentication
router.post('/owner/register', (req, res, next) => {
  req.authRole = 'owner';
  next();
}, register);

router.post('/owner/login', loginLimiter, (req, res, next) => {
  req.authRole = 'owner';
  next();
}, login);

// Admin authentication
router.post('/admin/login', loginLimiter, (req, res, next) => {
  req.authRole = 'admin';
  next();
}, login);

// Refresh token
router.post('/refresh', authApiLimiter, refresh);

// Current user
router.get('/me', protect, authApiLimiter, getMe);

// Logout
router.post('/logout', logout);

// Resend verification email
router.post('/resend-verification', authApiLimiter, resendVerification);

// Verify email token
router.get('/verify-email', verifyEmail);

// Verify OTP
router.post('/verify-otp', verifyOtp);

// Resend OTP
router.post('/resend-otp', authApiLimiter, resendOtp);

export default router;
