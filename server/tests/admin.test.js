import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app, connectDB } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Car } from '../src/models/Car.js';
import { Booking } from '../src/models/Booking.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

jest.setTimeout(30000);

let mongod;
let admin, owner, customer, car, booking;
let tokenAdmin, tokenOwner, tokenCustomer;

const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ replSet: { count: 1 } });
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  await connectDB(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await Car.deleteMany({});
  await User.deleteMany({});

  admin = await User.create({ name:'Admin', email:'admin@test.com', mobile:'111', password:'pass1234', role:'admin', isEmailVerified:true });
  owner = await User.create({ name:'Owner', email:'owner@test.com', mobile:'222', password:'pass1234', role:'owner', isEmailVerified:true });
  customer = await User.create({ name:'Cust', email:'cust@test.com', mobile:'333', password:'pass1234', role:'customer', isEmailVerified:true });
  car = await Car.create({ ownerId: owner._id, brand:'Toyota', model:'Corolla', registrationNumber:'ABC123', seatingCapacity:5, pricePerDay:50, location:'City', approvalStatus:'pending', isListed:false });
  booking = await Booking.create({ bookingReference:'BK1234', customerId:customer._id, ownerId:owner._id, carId:car._id, pickupDateTime:new Date(Date.now()+86400000), returnDateTime:new Date(Date.now()+172800000), pricePerDaySnapshot:50, totalAmount:100, bookingStatus:'pending', expiresAt:new Date(Date.now()+1800000) });

  tokenAdmin = generateToken(admin);
  tokenOwner = generateToken(owner);
  tokenCustomer = generateToken(customer);
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Admin API', () => {
  test('Admin can get stats', async () => {
    const res = await request(app).get('/api/admin/stats').set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.users).toBeGreaterThanOrEqual(0);
  });

  test('Non-admin cannot access admin stats', async () => {
    const res = await request(app).get('/api/admin/stats').set(auth(tokenOwner));
    expect(res.status).toBe(403);
  });

  test('Admin can list users and filter by role', async () => {
    const res = await request(app).get('/api/admin/users?role=owner').set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.every(u => u.role === 'owner')).toBe(true);
  });

  test('Admin can block/unblock user', async () => {
    const res = await request(app).patch(`/api/admin/users/${customer._id}/block`).set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.isBlocked).toBe(true);
    const res2 = await request(app).patch(`/api/admin/users/${customer._id}/block`).set(auth(tokenAdmin));
    expect(res2.body.data.isBlocked).toBe(false);
  });

  test('Admin cannot block another admin', async () => {
    const res = await request(app).patch(`/api/admin/users/${admin._id}/block`).set(auth(tokenAdmin));
    expect(res.status).toBe(400);
  });

  test('Admin can view pending cars', async () => {
    const res = await request(app).get('/api/admin/cars/pending').set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('Admin can approve car', async () => {
    const res = await request(app).patch(`/api/admin/cars/${car._id}/approve`).set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.approvalStatus).toBe('approved');
    expect(res.body.data.isListed).toBe(true);
  });

  test('Admin can reject car', async () => {
    const car2 = await Car.create({ ownerId: owner._id, brand:'Honda', model:'Civic', registrationNumber:'XYZ789', seatingCapacity:5, pricePerDay:60, location:'City', approvalStatus:'pending', isListed:false });
    const res = await request(app).patch(`/api/admin/cars/${car2._id}/reject`).set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.approvalStatus).toBe('rejected');
  });

  test('Admin can view all bookings', async () => {
    const res = await request(app).get('/api/admin/bookings').set(auth(tokenAdmin));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});