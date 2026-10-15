import { Booking } from '../models/Booking.js';
import { Car } from '../models/Car.js';
import { Lock } from '../models/Lock.js';
import { AppError } from '../utils/AppError.js';
import { generateReference, computeAmount, pendingExpiry } from '../utils/booking.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

export const createBooking = async (req, res, next) => {
  try {
    const { carId, pickupDateTime, returnDateTime } = req.body;
    const customer = req.user;

    if (!customer.isEmailVerified) throw new AppError('Email not verified', 403);

    const pickup = new Date(pickupDateTime);
    const ret = new Date(returnDateTime);
    if (isNaN(pickup) || isNaN(ret) || pickup >= ret || pickup < new Date())
      throw new AppError('Invalid pickup / return dates', 400);

    // Acquire exclusive lock on carId
    const holder = crypto.randomUUID();
    try {
      await Lock.create({ resource: carId.toString(), holder });
    } catch (e) {
      if (e.code === 11000) throw new AppError('Car already reserved for the selected period', 409);
      throw e;
    }

    let car;
    try {
      car = await Car.findById(carId);
      if (!car) throw new AppError('Car not found', 404);
      if (car.approvalStatus !== 'approved' || !car.isListed)
        throw new AppError('Car not available for booking', 400);
      if (car.ownerId.toString() === customer._id.toString())
        throw new AppError('You cannot book your own car', 400);

      // Check overlapping bookings (pending or confirmed)
      const overlap = await Booking.findOne({
        carId,
        bookingStatus: { $in: ['confirmed','pending'] },
        $or: [{ pickupDateTime: { $lt: ret }, returnDateTime: { $gt: pickup } }]
      });
      if (overlap) throw new AppError('Car already reserved for the selected period', 409);

      const { days, total } = computeAmount(pickup, ret, car.pricePerDay);

      const booking = await Booking.create({
        bookingReference: generateReference(),
        customerId: customer._id,
        ownerId: car.ownerId,
        carId,
        pickupDateTime: pickup,
        returnDateTime: ret,
        pricePerDaySnapshot: car.pricePerDay,
        totalAmount: total,
        bookingStatus: 'pending',
        expiresAt: pendingExpiry()
      });

      res.status(201).json({ status: 'success', data: booking });
    } finally {
      // Release lock
      await Lock.deleteOne({ resource: carId.toString(), holder });
    }
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 409) return next(err);
    next(err);
  }
};

export const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.ownerId.toString() !== req.user._id.toString())
      throw new AppError('Not authorised', 403);
    if (booking.bookingStatus !== 'pending')
      throw new AppError('Only pending bookings can be accepted', 400);

    // Check for overlapping confirmed bookings (excluding this one)
    const overlap = await Booking.findOne({
      carId: booking.carId,
      _id: { $ne: booking._id },
      bookingStatus: 'confirmed',
      $or: [{ pickupDateTime: { $lt: booking.returnDateTime }, returnDateTime: { $gt: booking.pickupDateTime } }]
    });
    if (overlap) throw new AppError('Another confirmed booking now overlaps', 409);

    booking.bookingStatus = 'confirmed';
    booking.expiresAt = undefined;
    await booking.save();

    res.json({ status: 'success', data: booking });
  } catch (err) { next(err); }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.ownerId.toString() !== req.user._id.toString())
      throw new AppError('Not authorised', 403);
    if (booking.bookingStatus !== 'pending')
      throw new AppError('Only pending bookings can be rejected', 400);
    booking.bookingStatus = 'rejected';
    booking.expiresAt = undefined;
    await booking.save();
    res.json({ status: 'success', data: booking });
  } catch (err) { next(err); }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.customerId.toString() !== req.user._id.toString())
      throw new AppError('Not authorised', 403);
    if (!['pending','confirmed'].includes(booking.bookingStatus))
      throw new AppError('Booking cannot be cancelled', 400);
    const hrs = (booking.pickupDateTime - Date.now()) / 3.6e6;
    if (hrs < 24) throw new AppError('Cancellation not allowed less than 24h before pickup', 400);
    booking.bookingStatus = 'cancelled';
    booking.expiresAt = undefined;
    await booking.save();
    res.json({ status: 'success', data: booking });
  } catch (err) { next(err); }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId', 'brand model images location pricePerDay')
      .populate('customerId', 'name email mobile')
      .populate('ownerId', 'name email')
      .lean();
    if (!booking) throw new AppError('Booking not found', 404);

    const isOwner = booking.ownerId._id.toString() === req.user._id.toString();
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    if (!isOwner && !isCustomer && req.user.role !== 'admin')
      throw new AppError('Not authorised', 403);

    res.json({ status: 'success', data: booking });
  } catch (err) { next(err); }
};

export const myBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { customerId: req.user._id };
    if (status) filter.bookingStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('carId', 'brand model images location pricePerDay')
        .lean(),
      Booking.countDocuments(filter)
    ]);

    res.json({ status: 'success', data, meta: { total, page: Number(page), lastPage: Math.ceil(total/Number(limit)) } });
  } catch (err) { next(err); }
};

export const ownerBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const myCarIds = await Car.find({ ownerId: req.user._id }).distinct('_id');
    const filter = { carId: { $in: myCarIds } };
    if (status) filter.bookingStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('carId', 'brand model images')
        .populate('customerId', 'name email mobile')
        .lean(),
      Booking.countDocuments(filter)
    ]);

    res.json({ status: 'success', data, meta: { total, page: Number(page), lastPage: Math.ceil(total/Number(limit)) } });
  } catch (err) { next(err); }
};