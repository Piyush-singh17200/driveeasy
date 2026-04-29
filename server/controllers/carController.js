const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const { createAuditLog } = require('../services/auditService');
const logger = require('../utils/logger');

const normalizeCarData = (body) => {
  const data = { ...body };

  if (!data.location) data.location = {};
  if (data['location[city]']) {
    data.location.city = data['location[city]'];
    delete data['location[city]'];
  }
  if (data['location[state]']) {
    data.location.state = data['location[state]'];
    delete data['location[state]'];
  }
  if (data['location[address]']) {
    data.location.address = data['location[address]'];
    delete data['location[address]'];
  }

  if (typeof data.features === 'string') {
    data.features = data.features.includes(',')
      ? data.features.split(',').map(feature => feature.trim()).filter(Boolean)
      : [data.features];
  }

  return data;
};

exports.getCars = async (req, res, next) => {
  try {
    const {
      city, category, minPrice, maxPrice, fuel, transmission, seats,
      available, sortBy, order, page = 1, limit = 12, search,
    } = req.query;

    const query = { isApproved: true };

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (category) query.category = category;
    if (fuel) query.fuel = fuel;
    if (transmission) query.transmission = transmission;
    if (seats) query.seats = { $gte: parseInt(seats) };
    if (available !== undefined) query.isAvailable = available === 'true';
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      Car.find(query)
        .populate('owner', 'name avatar rating')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Car.countDocuments(query),
    ]);

    res.json({
      success: true,
      cars,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name avatar phone email');

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Increment view count
    await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const carData = { ...normalizeCarData(req.body), owner: req.user.id };

    // Handle image uploads
    if (req.files?.length > 0) {
      const uploadPromises = req.files.map((file, idx) =>
        uploadImage(file.buffer, `cars/${req.user.id}`).then(result => ({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: idx === 0,
        }))
      );
      carData.images = await Promise.all(uploadPromises);
    } else if (req.body.images) {
      try {
        carData.images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
      } catch {
        carData.images = [];
      }
    }

    const car = await Car.create(carData);

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE_CAR',
      resource: 'Car',
      resourceId: car._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { carName: `${car.brand} ${car.model}` },
    });

    // Notify admin via socket
    const io = req.app.get('io');
    io.to('admin-room').emit('new_car_listing', {
      carId: car._id,
      carName: `${car.brand} ${car.model}`,
      ownerId: req.user.id,
    });

    res.status(201).json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    if (car.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this car' });
    }

    // Handle new image uploads
    if (req.files?.length > 0) {
      const uploadPromises = req.files.map((file, idx) =>
        uploadImage(file.buffer, `cars/${req.user.id}`).then(result => ({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: car.images.length === 0 && idx === 0,
        }))
      );
      const newImages = await Promise.all(uploadPromises);
      req.body.images = [...(car.images || []), ...newImages];
    }

    const updateData = normalizeCarData(req.body);

    car = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE_CAR',
      resource: 'Car',
      resourceId: car._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { updatedFields: Object.keys(updateData) },
    });

    // Emit availability update
    const io = req.app.get('io');
    io.emit('car_updated', { carId: car._id, isAvailable: car.isAvailable });

    res.json({ success: true, car });
  } catch (error) {
    next(error);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    if (car.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this car' });
    }

    // Check for active bookings
    const activeBookings = await Booking.findOne({
      car: req.params.id,
      status: { $in: ['confirmed', 'active'] },
    });

    if (activeBookings) {
      return res.status(400).json({ error: 'Cannot delete car with active bookings' });
    }

    // Delete images from Cloudinary
    if (car.images?.length > 0) {
      await Promise.all(car.images.map(img => deleteImage(img.publicId)));
    }

    await Car.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE_CAR',
      resource: 'Car',
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { carName: `${car.brand} ${car.model}` },
    });

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getOwnerCars = async (req, res, next) => {
  try {
    const cars = await Car.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    next(error);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { carId, startDate, endDate } = req.query;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    res.json({
      success: true,
      available: !conflictingBooking && car.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};
