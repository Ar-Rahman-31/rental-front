import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { User } from '../models/User.js';

export const initSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
                 || (socket.handshake.headers.cookie
                     && cookie.parse(socket.handshake.headers.cookie).access_token);

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id role');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { _id, role } = socket.user;
    socket.join(`user:${_id}`);

    socket.on('joinCarRoom', (carId) => {
      if (role === 'owner' || role === 'admin')
        socket.join(`car:${carId}`);
    });
  });

  app.set('io', io);
  return io;
};