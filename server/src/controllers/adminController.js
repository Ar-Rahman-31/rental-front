import { User } from '../models/User.js';
import { Car } from '../models/Car.js';
import { Booking } from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: users, meta: { total, page: Number(page), lastPage: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot block another admin', 400);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ status: 'success', data: { _id: user._id, isBlocked: user.isBlocked } });
  } catch (err) { next(err); }
};

export const getPendingCars = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [cars, total] = await Promise.all([
      Car.find({ approvalStatus: 'pending' }).populate('ownerId', 'name email').skip(skip).limit(Number(limit)).lean(),
      Car.countDocuments({ approvalStatus: 'pending' })
    ]);
    res.json({ status: 'success', data: cars, meta: { total, page: Number(page), lastPage: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

export const approveCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) throw new AppError('Car not found', 404);
    car.approvalStatus = 'approved';
    car.isListed = true;
    await car.save();
    res.json({ status: 'success', data: car });
  } catch (err) { next(err); }
};

export const rejectCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) throw new AppError('Car not found', 404);
    car.approvalStatus = 'rejected';
    car.isListed = false;
    await car.save();
    res.json({ status: 'success', data: car });
  } catch (err) { next(err); }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.bookingStatus = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('carId', 'brand model')
        .populate('customerId', 'name email')
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: bookings, meta: { total, page: Number(page), lastPage: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const [usersCount, ownersCount, carsCount, pendingCars, bookingsCount, pendingBookings, confirmedBookings] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'owner' }),
      Car.countDocuments({ approvalStatus: 'approved', isListed: true }),
      Car.countDocuments({ approvalStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'pending' }),
      Booking.countDocuments({ bookingStatus: 'confirmed' })
    ]);
    res.json({
      status: 'success',
      data: {
        users: usersCount,
        owners: ownersCount,
        listedCars: carsCount,
        pendingCars,
        totalBookings: bookingsCount,
        pendingBookings,
        confirmedBookings
      }
    });
  } catch (err) { next(err); }
};