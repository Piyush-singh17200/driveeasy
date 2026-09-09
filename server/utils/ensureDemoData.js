const User = require('../models/User');
const Car = require('../models/Car');
const logger = require('./logger');

const ensureDemoData = async () => {
  try {
    const approvedCarCount = await Car.countDocuments({ isApproved: true });
    if (approvedCarCount > 0) {
      return { seeded: false, count: approvedCarCount };
    }

    const existingOwner = await User.findOne({ email: 'owner@demo.com' });
    let owner = existingOwner;

    if (!owner) {
      owner = await User.create({
        name: 'Demo Owner',
        email: 'owner@demo.com',
        password: 'Demo1234',
        role: 'owner',
        phone: '9876543210',
        isVerified: true,
        isActive: true,
      });
    }

    const cars = await Car.create([
      {
        owner: owner._id,
        name: 'Maruti Suzuki Swift ZXi+',
        brand: 'Maruti Suzuki',
        model: 'Swift ZXi+',
        year: 2023,
        category: 'Hatchback',
        transmission: 'Manual',
        fuel: 'Petrol',
        seats: 5,
        pricePerDay: 1200,
        location: { city: 'Mumbai', state: 'Maharashtra', address: 'Bandra West' },
        images: [{ url: '/cars/maruti-swift.jpg', isPrimary: true }],
        features: ['AC', 'Bluetooth', 'Reverse Camera'],
        description: 'Demo car for local testing and showcase.',
        isAvailable: true,
        isApproved: true,
      },
      {
        owner: owner._id,
        name: 'Toyota Innova Crysta GX',
        brand: 'Toyota',
        model: 'Innova Crysta GX',
        year: 2022,
        category: 'Van',
        transmission: 'Automatic',
        fuel: 'Diesel',
        seats: 7,
        pricePerDay: 3500,
        location: { city: 'Mumbai', state: 'Maharashtra', address: 'Andheri East' },
        images: [{ url: '/cars/toyota-innova-crysta.jpg', isPrimary: true }],
        features: ['AC', 'Leather Seats', 'Rear AC'],
        description: 'Demo family vehicle for local testing.',
        isAvailable: true,
        isApproved: true,
      },
    ]);

    logger.info(`Seeded ${cars.length} demo cars for the catalog.`);
    return { seeded: true, count: cars.length };
  } catch (error) {
    logger.warn(`Demo data seeding skipped: ${error.message}`);
    return { seeded: false, count: 0 };
  }
};

module.exports = ensureDemoData;
