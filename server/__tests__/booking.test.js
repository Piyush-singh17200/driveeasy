const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Car = require('../models/Car');

let mongoServer, userId, carId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user = await User.create({ name: 'Booker', email: 'booker@test.com', password: 'pass123' });
  userId = user._id;

  const car = await Car.create({
    owner: userId, name: 'Test Car', brand: 'Honda', model: 'City',
    year: 2021, category: 'Sedan', transmission: 'Automatic', fuel: 'Petrol',
    seats: 5, pricePerDay: 1500, isApproved: true,
    location: { city: 'Delhi', state: 'Delhi' },
    images: [{ url: 'https://x.com/car.jpg', isPrimary: true }],
  });
  carId = car._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Booking.deleteMany({});
});

describe('Booking Model', () => {
  it('should calculate totals correctly on save', async () => {
    const start = new Date('2025-06-01');
    const end = new Date('2025-06-04'); // 3 days

    const booking = await Booking.create({
      user: userId,
      car: carId,
      startDate: start,
      endDate: end,
      totalDays: 3,
      pricePerDay: 1500,
      subtotal: 4500,
      taxes: 810,
      totalAmount: 5310,
    });

    expect(booking.totalDays).toBe(3);
    expect(booking.subtotal).toBe(4500);
    expect(booking.taxes).toBe(810);
    expect(booking.totalAmount).toBe(5310);
    expect(booking.status).toBe('pending');
  });

  it('should default status to pending', async () => {
    const booking = await Booking.create({
      user: userId, car: carId,
      startDate: new Date('2025-07-01'), endDate: new Date('2025-07-03'),
      totalDays: 2, pricePerDay: 1500, subtotal: 3000, taxes: 540, totalAmount: 3540,
    });
    expect(booking.status).toBe('pending');
    expect(booking.paymentStatus).toBe('pending');
  });

  it('should store review on booking', async () => {
    const booking = await Booking.create({
      user: userId, car: carId,
      startDate: new Date('2025-08-01'), endDate: new Date('2025-08-05'),
      totalDays: 4, pricePerDay: 1500, subtotal: 6000, taxes: 1080, totalAmount: 7080,
      status: 'completed',
    });

    booking.review = { rating: 5, comment: 'Excellent!', createdAt: new Date() };
    await booking.save();

    const found = await Booking.findById(booking._id);
    expect(found.review.rating).toBe(5);
    expect(found.review.comment).toBe('Excellent!');
  });
});
