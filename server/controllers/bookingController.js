const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

exports.createBooking = async (req, res, next) => {
  try {
    const { carId, startDate, endDate, pickupLocation, dropoffLocation, specialRequests } = req.body;

    const car = await Car.findById(carId).populate('owner', 'name email');
    if (!car) return res.status(404).json({ error: 'Car not found' });
    if (!car.isAvailable || !car.isApproved) {
      return res.status(400).json({ error: 'Car is not available for booking' });
    }

    // Check for conflicts
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date()) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    const conflict = await Booking.findOne({
      car: carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (conflict) {
      return res.status(409).json({ error: 'Car is already booked for selected dates' });
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.ceil((end - start) / msPerDay);
    const subtotal = totalDays * car.pricePerDay;
    const taxes = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxes;

    const booking = await Booking.create({
      user: req.user.id,
      car: carId,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay: car.pricePerDay,
      subtotal,
      taxes,
      totalAmount,
      pickupLocation,
      dropoffLocation,
      specialRequests,
    });

    // Add booked dates to car
    await Car.findByIdAndUpdate(carId, {
      $push: {
        bookedDates: { startDate: start, endDate: end, bookingId: booking._id },
      },
    });

    const io = req.app.get('io');

    // Notify all users that car is now unavailable
    io.emit('car_availability_changed', {
      carId,
      isAvailable: false,
      message: `Car just got booked`,
    });

    // Notify the car owner
    io.to(`user_${car.owner._id}`).emit('new_booking', {
      bookingId: booking._id,
      carName: `${car.brand} ${car.model}`,
      userName: req.user.name,
      dates: { start: startDate, end: endDate },
    });

    // Notify the user who booked
    io.to(`user_${req.user.id}`).emit('booking_created', {
      bookingId: booking._id,
      status: 'pending',
      message: 'Booking created successfully!',
    });

    // Send emails
    const user = await User.findById(req.user.id);
    sendEmail({
      to: user.email,
      subject: 'Booking Confirmation - DriveEasy',
      template: 'bookingConfirmation',
      data: {
        userName: user.name,
        carName: `${car.brand} ${car.model}`,
        startDate,
        endDate,
        totalAmount,
        bookingId: booking._id,
      },
    }).catch(err => logger.error('Booking email error:', err));

    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'name brand model images pricePerDay')
      .populate('user', 'name email');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('car', 'name brand model images location pricePerDay')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'name brand model images location pricePerDay owner')
      .populate('user', 'name email phone avatar');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const car = await Car.findById(booking.car._id);
    const isOwner = car?.owner.toString() === req.user.id;
    const isBookingUser = booking.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isBookingUser && !isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isBookingUser = booking.user.toString() === req.user.id;
    if (!isBookingUser && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: `Booking is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.id;
    await booking.save();

    // Remove booked dates from car
    await Car.findByIdAndUpdate(booking.car._id, {
      $pull: { bookedDates: { bookingId: booking._id } },
    });

    const io = req.app.get('io');
    io.emit('car_availability_changed', {
      carId: booking.car._id,
      isAvailable: true,
      message: 'Car became available',
    });

    io.to(`user_${booking.user}`).emit('booking_cancelled', {
      bookingId: booking._id,
      message: 'Your booking has been cancelled',
    });

    res.json({ success: true, booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getOwnerBookings = async (req, res, next) => {
  try {
    const ownerCars = await Car.find({ owner: req.user.id }).select('_id');
    const carIds = ownerCars.map(car => car._id);

    const { status, page = 1, limit = 10 } = req.query;
    const query = { car: { $in: carIds } };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('car', 'name brand model images')
        .populate('user', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('car').populate('user', 'name email');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isCarOwner = booking.car.owner.toString() === req.user.id;
    if (!isCarOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const validTransitions = {
      pending: ['confirmed', 'rejected'],
      confirmed: ['active', 'cancelled'],
      active: ['completed'],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${booking.status} to ${status}` });
    }

    booking.status = status;
    await booking.save();

    const io = req.app.get('io');
    io.to(`user_${booking.user._id}`).emit('booking_status_updated', {
      bookingId: booking._id,
      status,
      message: `Your booking has been ${status}`,
    });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, aspects } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }
    if (booking.review?.rating) {
      return res.status(400).json({ error: 'Booking already reviewed' });
    }

    booking.review = { rating, comment, createdAt: new Date() };
    await booking.save();

    const Review = require('../models/Review');
    const review = await Review.create({
      booking: booking._id,
      car: booking.car,
      user: req.user.id,
      rating,
      comment,
      aspects,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
