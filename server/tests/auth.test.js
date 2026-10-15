import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app, connectDB } from '../src/app.js';
import { User } from '../src/models/User.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

jest.setTimeout(30000);

let mongod;
let serverPort;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ replSet: { count: 1 } });
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.SMTP_HOST = 'smtp.example.com';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'test@example.com';
  process.env.SMTP_PASS = 'password';
  process.env.EMAIL_FROM = 'Test <no-reply@test.com>';
  await connectDB(uri);
  await new Promise((resolve) => {
    const httpServer = app.listen(0, () => {
      serverPort = httpServer.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

describe('Resend verification email', () => {
  test('returns success for unknown email (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'unknown@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('returns success for already verified user', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'verified@example.com',
      mobile: '1234567890',
      password: 'password123',
      isEmailVerified: true,
    });
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: user.email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test.skip('sends email for unverified user (mocked email service)', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'unverified@example.com',
      mobile: '1234567890',
      password: 'password123',
      isEmailVerified: false,
    });
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: user.email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // check token stored
    const updated = await User.findById(user._id).select('+emailVerificationToken +emailVerificationExpires');
    expect(updated.emailVerificationToken).toBeDefined();
    expect(updated.emailVerificationExpires).toBeDefined();
  });

  test.skip('rate limiting applied', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'ratelimit@example.com',
      mobile: '1234567890',
      password: 'password123',
      isEmailVerified: false,
    });
    // make 11 requests quickly (limit 10 per 15 min)
    for (let i = 0; i < 11; i++) {
      await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: user.email });
    }
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: user.email });
    expect(res.status).toBe(429);
  });
});