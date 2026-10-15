import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  createBooking,
  myBookings,
  ownerBookings,
  getBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking
} from '../controllers/bookingController.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('customer'), createBooking);
router.get('/my-bookings', restrictTo('customer'), myBookings);
router.get('/owner', restrictTo('owner','admin'), ownerBookings);
router.get('/:id', getBooking);
router.patch('/:id/accept', restrictTo('owner','admin'), acceptBooking);
router.patch('/:id/reject', restrictTo('owner','admin'), rejectBooking);
router.patch('/:id/cancel', restrictTo('customer'), cancelBooking);

export default router;