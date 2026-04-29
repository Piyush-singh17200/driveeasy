const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking, getBookings, getBooking, cancelBooking,
  getOwnerBookings, updateBookingStatus, addReview, getBookingMessages
} = require('../controllers/bookingController');
const { bookingValidator } = require('../middleware/validators');

router.post('/', protect, bookingValidator, createBooking);
router.get('/', protect, getBookings);
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);
router.post('/:id/review', protect, addReview);
router.get('/:id/messages', protect, getBookingMessages);

module.exports = router;
