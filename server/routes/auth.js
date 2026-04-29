// routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, verifyOTP, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
