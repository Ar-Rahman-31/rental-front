import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const email = process.env.ADMIN_EMAIL || 'admin@driveease.com';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('ADMIN_PASSWORD env variable required');
    process.exit(1);
  }
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  await User.create({
    name: 'Super Admin',
    email,
    mobile: '0000000000',
    password,
    role: 'admin',
    isEmailVerified: true
  });
  console.log('✅ Admin created');
  process.exit(0);
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});