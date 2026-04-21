const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getCars, getCar, createCar, updateCar, deleteCar, getOwnerCars, checkAvailability
} = require('../controllers/carController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', optionalAuth, getCars);
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerCars);
router.get('/availability', checkAvailability);
router.get('/:id', optionalAuth, getCar);
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), createCar);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), updateCar);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteCar);

module.exports = router;
