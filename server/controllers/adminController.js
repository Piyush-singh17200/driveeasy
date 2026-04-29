const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { prisma } = require('../config/postgres');
const { createAuditLog } = require('../services/auditService');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCars,
      totalBookings,
      activeBookings,
      pendingCars,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Car.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      Car.countDocuments({ isApproved: false }),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name email')
        .populate('car', 'brand model'),
    ]);

    let totalRevenue = 0;
    try {
      const revenueData = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      });
      totalRevenue = revenueData._sum.amount || 0;
    } catch {
      const revenueAgg = await Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]);
      totalRevenue = revenueAgg[0]?.total || 0;
    }

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    const carsByCategory = await Car.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCars,
        totalBookings,
        activeBookings,
        pendingCars,
        totalRevenue,
      },
      recentBookings,
      monthlyBookings,
      carsByCategory,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    res.json({
      success: true,
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE_USER_ADMIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { role, isActive },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.getAllCars = async (req, res, next) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      Car.find(query).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Car.countDocuments(query),
    ]);
    res.json({
      success: true,
      cars,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.approveCar = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { isApproved: approved },
      { new: true }
    ).populate('owner', 'name email');
    if (!car) return res.status(404).json({ error: 'Car not found' });

    await createAuditLog({
      userId: req.user.id,
      action: 'APPROVE_CAR',
      resource: 'Car',
      resourceId: car._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { approved },
    });

    const io = req.app.get('io');
    io.to(`user_${car.owner._id}`).emit('car_approval_status', {
      carId: car._id,
      carName: `${car.brand} ${car.model}`,
      approved,
      message: approved ? 'Your car listing has been approved!' : 'Your car listing was rejected.',
    });
    res.json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email')
        .populate('car', 'brand model images')
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
