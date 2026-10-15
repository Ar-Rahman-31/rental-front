import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, required: true }
}, { _id: false });

const carSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  seatingCapacity: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  description: String,
  images: [imageSchema],
  approvalStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  isListed: { type: Boolean, default: false },
  lockVersion: { type: Number, default: 0 }
}, { timestamps: true });

export const Car = mongoose.model('Car', carSchema);