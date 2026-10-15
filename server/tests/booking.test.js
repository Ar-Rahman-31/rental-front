import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app, connectDB } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Car } from '../src/models/Car.js';
import { Booking } from '../src/models/Booking.js';
import { expirePendingBookings, expiryInterval } from '../src/jobs/expireBookings.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

jest.setTimeout(30000);

let mongod;
let customer1, customer2, owner, car;
let tokenC1, tokenC2, tokenOwner;

const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ replSet: { count: 1 } });
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  await connectDB(uri);
});

afterAll(async () => {
  clearInterval(expiryInterval);
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await Car.deleteMany({});
  await User.deleteMany({});

  customer1 = await User.create({ name:'C1', email:'c1@test.com', mobile:'111', password:'pass1234', role:'customer', isEmailVerified:true });
  customer2 = await User.create({ name:'C2', email:'c2@test.com', mobile:'222', password:'pass1234', role:'customer', isEmailVerified:true });
  owner = await User.create({ name:'O1', email:'o1@test.com', mobile:'333', password:'pass1234', role:'owner', isEmailVerified:true });
  car = await Car.create({
    ownerId: owner._id,
    brand:'Toyota',
    model:'Corolla',
    registrationNumber:'ABC123',
    seatingCapacity:5,
    pricePerDay:50,
    location:'City',
    approvalStatus:'approved',
    isListed:true
  });

  tokenC1 = generateToken(customer1);
  tokenC2 = generateToken(customer2);
  tokenOwner = generateToken(owner);
});

describe('Booking API integration', () => {
  const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

  test('Customer can create a booking', async () => {
    const pickup = new Date(Date.now() + 24*60*60*1000);
    const ret = new Date(pickup.getTime() + 2*24*60*60*1000);
    const res = await request(app)
      .post('/api/bookings')
      .set(authHeader(tokenC1))
      .send({ carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() });
    expect(res.status).toBe(201);
    expect(res.body.data.bookingStatus).toBe('pending');
  });

  test('Two customers simultaneous overlapping bookings -> only one succeeds', async () => {
    const pickup = new Date(Date.now() + 24*60*60*1000);
    const ret = new Date(pickup.getTime() + 2*24*60*60*1000);
    const payload = { carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() };

    const [r1, r2] = await Promise.all([
      request(app).post('/api/bookings').set(authHeader(tokenC1)).send(payload),
      request(app).post('/api/bookings').set(authHeader(tokenC2)).send(payload)
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([201, 409]); // one created, one conflict
  });

  test('Non-overlapping bookings for same car both succeed', async () => {
    const pickup1 = new Date(Date.now() + 24*60*60*1000);
    const ret1 = new Date(pickup1.getTime() + 2*24*60*60*1000);
    const pickup2 = new Date(ret1.getTime() + 24*60*60*1000);
    const ret2 = new Date(pickup2.getTime() + 1*24*60*60*1000);

    const r1 = await request(app).post('/api/bookings').set(authHeader(tokenC1))
      .send({ carId: car._id.toString(), pickupDateTime: pickup1.toISOString(), returnDateTime: ret1.toISOString() });
    const r2 = await request(app).post('/api/bookings').set(authHeader(tokenC2))
      .send({ carId: car._id.toString(), pickupDateTime: pickup2.toISOString(), returnDateTime: ret2.toISOString() });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
  });

  test('Pending booking expires and releases availability', async () => {
    const pickup = new Date(Date.now() + 24*60*60*1000);
    const ret = new Date(pickup.getTime() + 2*24*60*60*1000);
    const r1 = await request(app).post('/api/bookings').set(authHeader(tokenC1))
      .send({ carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() });
    expect(r1.status).toBe(201);

    // manually expire
    await Booking.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    // run expiry job directly
    await expirePendingBookings();

    const r2 = await request(app).post('/api/bookings').set(authHeader(tokenC2))
      .send({ carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() });
    expect(r2.status).toBe(201);
  });

  test('Owner can accept only their own bookings', async () => {
    const pickup = new Date(Date.now() + 24*60*60*1000);
    const ret = new Date(pickup.getTime() + 2*24*60*60*1000);
    const createRes = await request(app).post('/api/bookings').set(authHeader(tokenC1))
      .send({ carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() });
    const bookingId = createRes.body.data._id;

    // another owner
    const otherOwner = await User.create({ name:'O2', email:'o2@test.com', mobile:'444', password:'pass1234', role:'owner', isEmailVerified:true });
    const tokenOther = generateToken(otherOwner);
    const rejectRes = await request(app).patch(`/api/bookings/${bookingId}/accept`).set(authHeader(tokenOther));
    expect(rejectRes.status).toBe(403);

    const acceptRes = await request(app).patch(`/api/bookings/${bookingId}/accept`).set(authHeader(tokenOwner));
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.bookingStatus).toBe('confirmed');
  });

  test('Unverified customer cannot create booking', async () => {
    const unverified = await User.create({ name:'U', email:'u@test.com', mobile:'555', password:'pass1234', role:'customer', isEmailVerified:false });
    const tokenU = generateToken(unverified);
    const pickup = new Date(Date.now() + 24*60*60*1000);
    const ret = new Date(pickup.getTime() + 2*24*60*60*1000);
    const res = await request(app).post('/api/bookings').set(authHeader(tokenU))
      .send({ carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() });
    expect(res.status).toBe(403);
  });

  test('Cancellation policy enforced (<24h)', async () => {
    const pickup = new Date(Date.now() + 12*60*60*1000);
    const ret = new Date(pickup.getTime() + 24*60*60*1000);
    const createRes = await request(app).post('/api/bookings').set(authHeader(tokenC1))
      .send({ carId: car._id.toString(), pickupDateTime: pickup.toISOString(), returnDateTime: ret.toISOString() });
    const bookingId = createRes.body.data._id;
    const cancelRes = await request(app).patch(`/api/bookings/${bookingId}/cancel`).set(authHeader(tokenC1));
    expect(cancelRes.status).toBe(400);
  });
});