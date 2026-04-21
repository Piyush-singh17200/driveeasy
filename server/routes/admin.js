const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats, getAllUsers, updateUser,
  getAllCars, approveCar, getAllBookings
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/cars', getAllCars);
router.put('/cars/:id/approve', approveCar);
router.get('/bookings', getAllBookings);

module.exports = router;
