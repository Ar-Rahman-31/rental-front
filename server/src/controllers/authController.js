
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendVerificationEmail, sendOtpEmail } from '../services/email.js';

// Generate JWT token
const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in .env');
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Send token in HTTP-only cookie
const sendAuthResponse = (user, statusCode, res) => {
  const token = createToken(user._id);

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  const safeUser = user.toObject();
  delete safeUser.password;

  res.status(statusCode).json({
    success: true,
    user: safeUser,
  });
};

// Register customer or owner
export const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Role is set by authRoutes.js middleware
    const role = req.authRole || 'customer';

    if (!['customer', 'owner'].includes(role)) {
      return next(new AppError('Invalid user role', 400));
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !mobile?.trim() ||
      !password
    ) {
      return next(
        new AppError('Please provide all required fields', 400)
      );
    }

    if (password.length < 8) {
      return next(
        new AppError('Password must be at least 8 characters', 400)
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return next(
        new AppError('Email is already registered', 409)
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password,
      role,
      otpHash,
      otpExpires,
      otpAttempts: 0,
    });

    await sendOtpEmail(user.email, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful. A 6‑digit OTP has been sent to your e‑mail.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError('Email is already registered', 409)
      );
    }

    next(error);
  }
};

// Login customer or owner
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Role is set by authRoutes.js middleware
    const role = req.authRole || 'customer';

    if (!email?.trim() || !password) {
      return next(
        new AppError('Email and password are required', 400)
      );
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role,
    }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return next(
        new AppError('Incorrect email or password', 401)
      );
    }

    if (!user.isEmailVerified) {
      return next(
        new AppError('Email not verified. Please verify your e‑mail before logging in.', 403)
      );
    }

    if (user.isBlocked) {
      return next(
        new AppError('Your account is blocked', 403)
      );
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get currently logged-in user
export const getMe = (req, res) => {
  const user = req.user.toObject();
  delete user.password;

  res.status(200).json({
    success: true,
    user,
  });
};

// Logout
export const logout = (_req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// Resend verification email
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond with success to avoid email enumeration
    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'If the email is registered and not verified, a verification link has been sent.',
      });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    user.emailVerificationToken = hashed;
    user.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, token);

    res.status(200).json({
      success: true,
      message: 'Verification email sent.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify email token
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Email verified successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
export const refresh = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return next(new AppError('No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch user to ensure still exists and not blocked
    // but for simplicity just issue new token
    const newToken = createToken(decoded.id);

    res.cookie('access_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.NODE_ENV === 'production'
          ? 'none'
          : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({ success: true });
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

// Verify OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new AppError('Email and OTP are required', 400));

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otpHash +otpExpires +otpAttempts');
    if (!user) return next(new AppError('User not found', 404));
    if (user.isEmailVerified) return next(new AppError('Email already verified', 400));

    if (user.otpAttempts >= 5) return next(new AppError('Too many attempts. Request a new OTP.', 429));
    if (!user.otpExpires || user.otpExpires < Date.now()) return next(new AppError('OTP expired. Request a new one.', 400));

    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashed !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Invalid OTP', 401));
    }

    // success
    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    sendAuthResponse(user, 200, res);
  } catch (error) { next(error); }
};

// Resend OTP
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ success:true, message:'If the account exists and is unverified, a new OTP has been sent.' });
    if (user.isEmailVerified) return res.status(200).json({ success:true, message:'Email already verified.' });

    // cooldown – 1 min since last OTP sent
    if (user.otpExpires && user.otpExpires > Date.now() - 60_000) {
      return next(new AppError('Please wait before requesting another OTP.', 429));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpHash = hashed;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, otp);
    res.status(200).json({ success:true, message:'A new OTP has been sent.' });
  } catch (error) { next(error); }
};
