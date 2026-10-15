import { Booking } from '../models/Booking.js';

export const expirePendingBookings = async () => {
  const now = new Date();
  const result = await Booking.updateMany(
    { bookingStatus: 'pending', expiresAt: { $lt: now } },
    { $set: { bookingStatus: 'cancelled', expiresAt: null } }
  );
  if (result.modifiedCount) {
    console.log(`Expired ${result.modifiedCount} pending bookings`);
  }
};

let expiryInterval = null;

export const startExpiryJob = (io) => {
  if (expiryInterval) return expiryInterval;
  expiryInterval = setInterval(() => expirePendingBookings(io), 60 * 1000);
  return expiryInterval;
};

export const stopExpiryJob = () => {
  if (expiryInterval) {
    clearInterval(expiryInterval);
    expiryInterval = null;
  }
};

export { expiryInterval };