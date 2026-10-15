import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getUsers,
  toggleBlockUser,
  getPendingCars,
  approveCar,
  rejectCar,
  getAllBookings,
  getStats
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.get('/cars/pending', getPendingCars);
router.patch('/cars/:id/approve', approveCar);
router.patch('/cars/:id/reject', rejectCar);
router.get('/bookings', getAllBookings);

export default router;