import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { io as ClientIO } from 'socket.io-client';
import { app, connectDB, httpServer } from '../src/app.js';
import { initSocket } from '../src/socket/index.js';
import { User } from '../src/models/User.js';
import { Car } from '../src/models/Car.js';
import { Booking } from '../src/models/Booking.js';
import { stopExpiryJob } from '../src/jobs/expireBookings.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

jest.setTimeout(120000);

let mongod;
let owner, customer, car;
let tokenOwner, tokenCustomer;
let serverPort;
let ioServer;
let ownerSocket, custSocket;

const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ replSet: { count: 1 } });
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  // temporary placeholder, will set after port known
  await connectDB(uri);
  await new Promise((resolve) => {
    httpServer.listen(0, () => {
      serverPort = httpServer.address().port;
      process.env.CLIENT_URL = `http://localhost:${serverPort}`;
      resolve();
    });
  });
  ioServer = initSocket(httpServer, app);
});

afterAll(async () => {
  if (ownerSocket) ownerSocket.close();
  if (custSocket) custSocket.close();
  await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await Car.deleteMany({});
  await User.deleteMany({});

  owner = await User.create({ name:'Owner', email:'owner@test.com', mobile:'111', password:'pass1234', role:'owner', isEmailVerified:true });
  customer = await User.create({ name:'Cust', email:'cust@test.com', mobile:'222', password:'pass1234', role:'customer', isEmailVerified:true });
  car = await Car.create({ ownerId: owner._id, brand:'Toyota', model:'Corolla', registrationNumber:'ABC123', seatingCapacity:5, pricePerDay:50, location:'City', approvalStatus:'approved', isListed:true });

  tokenOwner = generateToken(owner);
  tokenCustomer = generateToken(customer);
});

afterEach(async () => {
  if (ownerSocket) { ownerSocket.close(); ownerSocket = null; }
  if (custSocket) { custSocket.close(); custSocket = null; }
});

const createSocket = (token) => ClientIO(`http://localhost:${serverPort}`, {
  auth: { token },
  transports: ['websocket', 'polling'],
  forceNew: true,
  reconnection: false
});

describe('Socket.IO authentication and notifications', () => {
  test('Rejects connection without token', (done) => {
    const socket = ClientIO(`http://localhost:${serverPort}`, { transports:['websocket'], forceNew:true, reconnection:false });
    socket.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication required');
      socket.close();
      done();
    });
  });

  test('Owner receives booking:created when customer books', async () => {
    ownerSocket = createSocket(tokenOwner);
    custSocket = createSocket(tokenCustomer);

    // wait for both sockets to connect
    await Promise.all([
      new Promise((resolve, reject) => {
        ownerSocket.on('connect', resolve);
        ownerSocket.on('connect_error', reject);
      }),
      new Promise((resolve, reject) => {
        custSocket.on('connect', resolve);
        custSocket.on('connect_error', reject);
      })
    ]);

    const bookingPromise = new Promise((resolve, reject) => {
      ownerSocket.on('booking:created', resolve);
      ownerSocket.on('connect_error', reject);
    });

    // customer creates booking via REST
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send({ carId: car._id.toString(), pickupDateTime: new Date(Date.now()+86400000).toISOString(), returnDateTime: new Date(Date.now()+172800000).toISOString() });
    expect(res.status).toBe(201);

    const payload = await bookingPromise;
    expect(payload.carId).toBe(car._id.toString());
  });

  test('Customer receives booking:accepted after owner accepts', async () => {
    ownerSocket = createSocket(tokenOwner);
    custSocket = createSocket(tokenCustomer);

    await Promise.all([
      new Promise((resolve, reject) => {
        ownerSocket.on('connect', resolve);
        ownerSocket.on('connect_error', reject);
      }),
      new Promise((resolve, reject) => {
        custSocket.on('connect', resolve);
        custSocket.on('connect_error', reject);
      })
    ]);

    // create booking first via REST
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send({ carId: car._id.toString(), pickupDateTime: new Date(Date.now()+86400000).toISOString(), returnDateTime: new Date(Date.now()+172800000).toISOString() });
    expect(createRes.status).toBe(201);
    const bookingId = createRes.body.data._id;

    const acceptPromise = new Promise((resolve, reject) => {
      custSocket.on('booking:accepted', resolve);
      custSocket.on('connect_error', reject);
    });

    // owner accepts via REST
    const acceptRes = await request(app).patch(`/api/bookings/${bookingId}/accept`).set('Authorization', `Bearer ${tokenOwner}`);
    expect(acceptRes.status).toBe(200);

    const payload = await acceptPromise;
    expect(payload._id).toBe(bookingId);
  });
});