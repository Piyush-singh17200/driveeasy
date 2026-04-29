const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { prisma } = require('../config/postgres');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('car', 'name brand model');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // in paise
      currency: 'inr',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
      },
    });

    // Store in PostgreSQL
    await prisma.payment.upsert({
      where: { bookingId: booking._id.toString() },
      update: { stripePaymentId: paymentIntent.id, status: 'PROCESSING' },
      create: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        amount: booking.totalAmount,
        currency: 'INR',
        stripePaymentId: paymentIntent.id,
        status: 'PROCESSING',
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Update payment in PostgreSQL
    await prisma.payment.update({
      where: { bookingId },
      data: { status: 'COMPLETED', method: paymentIntent.payment_method_types[0] },
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        paymentId: bookingId,
        type: 'PAYMENT',
        amount: paymentIntent.amount / 100,
        description: `Payment for booking ${bookingId}`,
        metadata: { stripePaymentId: paymentIntentId },
      },
    });

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      paymentId: paymentIntentId,
      status: 'confirmed',
    });

    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('payment_success', {
      bookingId,
      message: 'Payment successful! Your booking is confirmed.',
    });

    res.json({ success: true, message: 'Payment confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.confirmUpiPayment = async (req, res, next) => {
  try {
    const { bookingId, utrNumber } = req.body;

    if (!utrNumber || !/^[A-Za-z0-9]{6,20}$/.test(utrNumber)) {
      return res.status(400).json({ error: 'Valid UTR number is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.payment.upsert({
      where: { bookingId: booking._id.toString() },
      update: {
        status: 'COMPLETED',
        method: 'UPI',
        metadata: { utrNumber },
      },
      create: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        amount: booking.totalAmount,
        currency: 'INR',
        status: 'COMPLETED',
        method: 'UPI',
        metadata: { utrNumber },
      },
    });

    await prisma.transaction.create({
      data: {
        paymentId: booking._id.toString(),
        type: 'PAYMENT',
        amount: booking.totalAmount,
        description: `UPI payment for booking ${booking._id}`,
        metadata: { utrNumber },
      },
    });

    booking.paymentStatus = 'paid';
    booking.paymentId = utrNumber;
    booking.status = 'confirmed';
    await booking.save();

    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('payment_success', {
      bookingId,
      message: 'Payment successful! Your booking is confirmed.',
    });

    res.json({ success: true, booking, message: 'UPI payment confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      logger.info(`Payment succeeded: ${event.data.object.id}`);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'FAILED' },
      }).catch(logger.error);
      break;
    default:
      logger.info(`Unhandled webhook event: ${event.type}`);
  }

  res.json({ received: true });
};
