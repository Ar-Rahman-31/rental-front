
import express from 'express';
import { upload } from '../middleware/upload.js';

import {
  getCars,
  getCarById,
  createCar,
} from '../controllers/carController.js';

import {
  protect,
  restrictTo,
} from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Only authenticated owners can add cars
router.post(
  '/',
  protect,
  restrictTo('owner'),
  upload.array('photos', 8),
  createCar
);

export default router;
