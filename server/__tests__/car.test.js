const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Car = require('../models/Car');
const User = require('../models/User');

let mongoServer;
let ownerId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const owner = await User.create({
    name: 'Car Owner',
    email: 'owner@test.com',
    password: 'password123',
    role: 'owner',
  });
  ownerId = owner._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Car.deleteMany({});
});

const validCarData = () => ({
  owner: ownerId,
  name: 'Swift Test',
  brand: 'Maruti',
  model: 'Swift',
  year: 2022,
  category: 'Hatchback',
  transmission: 'Manual',
  fuel: 'Petrol',
  seats: 5,
  pricePerDay: 1200,
  location: { city: 'Mumbai', state: 'Maharashtra' },
  images: [{ url: 'https://example.com/car.jpg', isPrimary: true }],
});

describe('Car Model', () => {
  it('should create a car with valid data', async () => {
    const car = await Car.create(validCarData());
    expect(car.brand).toBe('Maruti');
    expect(car.isAvailable).toBe(true);
    expect(car.isApproved).toBe(false);
    expect(car.rating.average).toBe(0);
  });

  it('should reject car with price below minimum', async () => {
    const data = { ...validCarData(), pricePerDay: 50 };
    await expect(Car.create(data)).rejects.toThrow();
  });

  it('should reject invalid category', async () => {
    const data = { ...validCarData(), category: 'Spaceship' };
    await expect(Car.create(data)).rejects.toThrow();
  });

  it('should reject invalid fuel type', async () => {
    const data = { ...validCarData(), fuel: 'Hydrogen' };
    await expect(Car.create(data)).rejects.toThrow();
  });

  it('should enforce seats range', async () => {
    const data = { ...validCarData(), seats: 1 };
    await expect(Car.create(data)).rejects.toThrow();
  });

  it('should index by location city', async () => {
    await Car.create(validCarData());
    const cars = await Car.find({ 'location.city': 'Mumbai' });
    expect(cars.length).toBe(1);
  });

  it('should filter by isApproved', async () => {
    await Car.create(validCarData());
    await Car.create({ ...validCarData(), isApproved: true });
    const approvedCars = await Car.find({ isApproved: true });
    expect(approvedCars.length).toBe(1);
  });
});
