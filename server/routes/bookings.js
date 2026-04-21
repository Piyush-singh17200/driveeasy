const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking, getBookings, getBooking, cancelBooking,
  getOwnerBookings, updateBookingStatus, addReview
} = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);
router.post('/:id/review', protect, addReview);

module.exports = router;
