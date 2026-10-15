import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer','owner','admin'], default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  otpHash: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
}, { timestamps: true });

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidate){
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);