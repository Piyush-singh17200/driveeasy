// routes/payments.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent, confirmPayment, confirmUpiPayment, getPaymentHistory, stripeWebhook } = require('../controllers/paymentController');

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/confirm-upi', protect, confirmUpiPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
