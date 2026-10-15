// src/services/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket?.connected) return socket;
  const token = window.__DRIVEEASE_ACCESS_TOKEN__;
  if (!token) return null;
  socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socket.on('connect_error', (err) => console.warn('[Socket] connect error:', err.message));
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { if (socket) { socket.disconnect(); socket = null; } };

export const onBookingCreated  = (cb) => socket?.on('booking:created', cb);
export const onBookingAccepted = (cb) => socket?.on('booking:accepted', cb);
export const onBookingRejected = (cb) => socket?.on('booking:rejected', cb);
export const onBookingCancelled= (cb) => socket?.on('booking:cancelled', cb);
export const onBookingExpired  = (cb) => socket?.on('booking:expired', cb);

export const offBookingEvents = () => {
  ['booking:created','booking:accepted','booking:rejected','booking:cancelled','booking:expired']
    .forEach(ev => socket?.off(ev));
};