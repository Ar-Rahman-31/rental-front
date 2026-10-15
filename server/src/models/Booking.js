import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  pickupDateTime: { type: Date, required: true },
  returnDateTime: { type: Date, required: true },
  pricePerDaySnapshot: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  bookingStatus: { type: String, enum: ['pending','confirmed','rejected','cancelled','completed'], default: 'pending' },
  expiresAt: { type: Date }
}, { timestamps: true });

bookingSchema.index({ carId: 1, pickupDateTime: 1, returnDateTime: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);