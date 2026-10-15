import mongoose from 'mongoose';

const lockSchema = new mongoose.Schema({
  resource: { type: String, required: true, unique: true },
  holder: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 } // TTL 30 sec
});

export const Lock = mongoose.model('Lock', lockSchema);