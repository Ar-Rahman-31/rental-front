
import mongoose from 'mongoose';
import { Car } from '../models/Car.js';
import { AppError } from '../utils/AppError.js';
import { uploadToImageKit } from '../services/imagekit.js';

// GET /api/cars
// Get approved and listed cars with filters and pagination
export const getCars = async (req, res, next) => {
  try {
    const {
      q = '',
      location = '',
      minPrice,
      maxPrice,
      seats,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      approvalStatus: 'approved',
      isListed: true,
    };

    // Search by brand or model
    if (q.trim()) {
      const escapedQuery = q.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const regex = new RegExp(escapedQuery, 'i');

      filter.$or = [
        { brand: regex },
        { model: regex },
      ];
    }

    // Filter by location
    if (location.trim()) {
      const escapedLocation = location.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.location = {
        $regex: escapedLocation,
        $options: 'i',
      };
    }

    // Minimum price
    if (minPrice !== undefined && minPrice !== '') {
      const value = Number(minPrice);

      if (!Number.isFinite(value) || value < 0) {
        return next(new AppError('Invalid minimum price', 400));
      }

      filter.pricePerDay = {
        ...filter.pricePerDay,
        $gte: value,
      };
    }

    // Maximum price
    if (maxPrice !== undefined && maxPrice !== '') {
      const value = Number(maxPrice);

      if (!Number.isFinite(value) || value < 0) {
        return next(new AppError('Invalid maximum price', 400));
      }

      filter.pricePerDay = {
        ...filter.pricePerDay,
        $lte: value,
      };
    }

    // Filter by seating capacity
    if (seats !== undefined && seats !== '') {
      const value = Number(seats);

      if (!Number.isInteger(value) || value < 1) {
        return next(new AppError('Invalid seating capacity', 400));
      }

      filter.seatingCapacity = value;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 12)
    );

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { pricePerDay: 1 },
      price_desc: { pricePerDay: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .select('-lockVersion')
        .sort(sortBy)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Car.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cars/:id
// Get one approved and listed car
export const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError('Invalid car ID', 400));
    }

    const car = await Car.findOne({
      _id: id,
      approvalStatus: 'approved',
      isListed: true,
    })
      .select('-lockVersion')
      .lean();

    if (!car) {
      return next(new AppError('Car not found', 404));
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cars
// Create a car listing for the authenticated owner
export const createCar = async (req, res, next) => {
  try {
    // Temporary diagnostics (safe, no secrets)
    console.log('[createCar] files received:', req.files ? req.files.length : 0);
    console.log('[createCar] body keys:', Object.keys(req.body));

    const {
      brand,
      model,
      registrationNumber,
      seatingCapacity,
      pricePerDay,
      location,
      description,
    } = req.body;

    // Validate required fields
    if (
      typeof brand !== 'string' ||
      !brand.trim() ||
      typeof model !== 'string' ||
      !model.trim() ||
      typeof registrationNumber !== 'string' ||
      !registrationNumber.trim() ||
      seatingCapacity === undefined ||
      seatingCapacity === '' ||
      pricePerDay === undefined ||
      pricePerDay === '' ||
      typeof location !== 'string' ||
      !location.trim()
    ) {
      return next(
        new AppError('Please provide all required car details', 400)
      );
    }

    const seats = Number(seatingCapacity);
    const price = Number(pricePerDay);

    if (!Number.isInteger(seats) || seats < 1) {
      return next(
        new AppError(
          'Seating capacity must be a positive integer',
          400
        )
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return next(
        new AppError('Price per day must be greater than zero', 400)
      );
    }

    // Ensure at least one image uploaded
    if (!req.files || req.files.length === 0) {
      return next(new AppError('At least one car image is required', 400));
    }

    const normalizedRegistration = registrationNumber
      .trim()
      .toUpperCase();

    const existingCar = await Car.findOne({
      registrationNumber: normalizedRegistration,
    });

    if (existingCar) {
      return next(
        new AppError(
          'This registration number is already registered',
          409
        )
      );
    }

    // Upload images to ImageKit
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await uploadToImageKit(file.buffer, file.originalname);
      uploadedImages.push({
        url: result.url,
        fileId: result.fileId,
      });
    }

    // Save the car as pending until an admin approves it.
    const car = await Car.create({
      ownerId: req.user._id,
      brand: brand.trim(),
      model: model.trim(),
      registrationNumber: normalizedRegistration,
      seatingCapacity: seats,
      pricePerDay: price,
      location: location.trim(),
      description:
        typeof description === 'string'
          ? description.trim()
          : '',
      images: uploadedImages,
      approvalStatus: 'pending',
      isListed: false,
    });

    res.status(201).json({
      success: true,
      message: 'Car submitted for admin review',
      data: car,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError(
          'This registration number is already registered',
          409
        )
      );
    }

    next(error);
  }
};
