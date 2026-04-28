require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'Admin1234',
    role: 'admin',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'John Owner',
    email: 'owner@demo.com',
    password: 'Demo1234',
    role: 'owner',
    phone: '+91 98765 43210',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Priya User',
    email: 'user@demo.com',
    password: 'Demo1234',
    role: 'user',
    phone: '+91 87654 32109',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@demo.com',
    password: 'Demo1234',
    role: 'owner',
    phone: '+91 76543 21098',
    isVerified: true,
    isActive: true,
  },
];

const seedCars = (ownerIds) => [
  {
    owner: ownerIds[0],
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
    images: [
      { url: '/cars/swift.png', isPrimary: true },
    ],
    features: ['AC', 'Bluetooth', 'Reverse Camera', 'Power Windows', 'ABS'],
    description: 'Brand new Swift with all modern features. Perfect for city drives.',
    isAvailable: true,
    isApproved: true,
    mileage: '22 kmpl',
    rating: { average: 4.5, count: 12 },
  },
  {
    owner: ownerIds[0],
    name: 'Toyota Innova Crysta Luxury',
    brand: 'Toyota',
    model: 'Innova Crysta',
    year: 2022,
    category: 'Van',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 7,
    pricePerDay: 3500,
    location: { city: 'Mumbai', state: 'Maharashtra', address: 'Andheri East' },
    images: [
      { url: '/cars/innova.png', isPrimary: true },
    ],
    features: ['AC', 'Leather Seats', 'Push Button Start', 'Rear AC', 'USB Ports', 'Captain Seats'],
    description: '7-seater premium MPV. Great for family trips and airport transfers.',
    isAvailable: true,
    isApproved: true,
    mileage: '14 kmpl',
    rating: { average: 4.8, count: 28 },
  },
  {
    owner: ownerIds[1],
    name: 'Hyundai Creta SX (Knight Edition)',
    brand: 'Hyundai',
    model: 'Creta SX',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 2800,
    location: { city: 'Bangalore', state: 'Karnataka', address: 'Koramangala' },
    images: [
      { url: '/cars/creta.png', isPrimary: true },
    ],
    features: ['Panoramic Sunroof', 'Ventilated Seats', 'BOSE Sound', 'BlueLink', 'Lane Assist'],
    description: 'Top-spec Creta with panoramic sunroof and premium features.',
    isAvailable: true,
    isApproved: true,
    mileage: '16 kmpl',
    rating: { average: 4.7, count: 19 },
  },
  {
    owner: ownerIds[1],
    name: 'Tata Nexon EV Max',
    brand: 'Tata',
    model: 'Nexon EV Max',
    year: 2023,
    category: 'Electric',
    transmission: 'Automatic',
    fuel: 'Electric',
    seats: 5,
    pricePerDay: 2200,
    location: { city: 'Pune', state: 'Maharashtra', address: 'Wakad' },
    images: [
      { url: '/cars/nexon.png', isPrimary: true },
    ],
    features: ['400km Range', 'Fast Charging', 'Connected Car Tech', 'ADAS Suite', 'Harman Audio'],
    description: 'Go green with Nexon EV Max. 400km range on single charge.',
    isAvailable: true,
    isApproved: true,
    mileage: '437 km/charge',
    rating: { average: 4.6, count: 15 },
  },
  {
    owner: ownerIds[0],
    name: 'BMW 5 Series 530d M Sport',
    brand: 'BMW',
    model: '530d M Sport',
    year: 2022,
    category: 'Luxury',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 5,
    pricePerDay: 8500,
    location: { city: 'Delhi', state: 'Delhi', address: 'Connaught Place' },
    images: [
      { url: '/cars/bmw.png', isPrimary: true },
    ],
    features: ['Leather Interior', 'Heads-Up Display', 'Parking Assistant', 'Ambient Lighting', 'Adaptive Cruise'],
    description: 'Experience ultimate luxury with the BMW 5 Series. Perfect for business travel.',
    isAvailable: true,
    isApproved: true,
    mileage: '17 kmpl',
    rating: { average: 4.9, count: 8 },
  },
  {
    owner: ownerIds[1],
    name: 'Mahindra Thar LX 4x4',
    brand: 'Mahindra',
    model: 'Thar LX',
    year: 2023,
    category: 'SUV',
    transmission: 'Manual',
    fuel: 'Diesel',
    seats: 4,
    pricePerDay: 3200,
    location: { city: 'Goa', state: 'Goa', address: 'Panjim' },
    images: [
      { url: '/cars/thar.png', isPrimary: true },
    ],
    features: ['4x4 Drive', 'Convertible', 'Snorkel', 'Off-Road Terrain', 'Rock Crawling Mode'],
    description: 'Perfect for Goa beach drives and off-road adventures!',
    isAvailable: true,
    isApproved: true,
    mileage: '15 kmpl',
    rating: { average: 4.7, count: 23 },
  },
  {
    owner: ownerIds[0],
    name: 'Honda City 5th Gen',
    brand: 'Honda',
    model: 'City 5th Gen',
    year: 2022,
    category: 'Sedan',
    transmission: 'CVT',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 1800,
    location: { city: 'Chennai', state: 'Tamil Nadu', address: 'Anna Nagar' },
    images: [
      { url: '/cars/honda.png', isPrimary: true },
    ],
    features: ['Honda Sensing', 'Wireless Carplay', 'Heated Mirrors', 'LaneWatch', 'LKAS'],
    description: 'Reliable and fuel-efficient sedan with advanced safety features.',
    isAvailable: true,
    isApproved: true,
    mileage: '18 kmpl',
    rating: { average: 4.4, count: 31 },
  },
  {
    owner: ownerIds[1],
    name: 'Kia Seltos HTX+',
    brand: 'Kia',
    model: 'Seltos HTX+',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 2400,
    location: { city: 'Hyderabad', state: 'Telangana', address: 'Madhapur' },
    images: [
      { url: 'https://imgd.aeplcdn.com/1200x900/n/cw/ec/144163/seltos-exterior-right-front-three-quarter.jpeg', isPrimary: true },
    ],
    features: ['10.25" Touchscreen', 'Bose Sound', 'ADAS', 'OTA Updates', 'Sunroof'],
    description: 'Feature-packed SUV with segment-best tech and comfort.',
    isAvailable: true,
    isApproved: true,
    mileage: '16 kmpl',
    rating: { average: 4.5, count: 17 },
  },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Car.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('👤 Creating users...');
    const users = await User.create(seedUsers);
    const ownerUsers = users.filter(u => u.role === 'owner');
    console.log(`   ✅ Created ${users.length} users`);
    console.log('🚗 Creating cars...');
    const cars = await Car.create(seedCars([ownerUsers[0]._id, ownerUsers[1]._id]));
    console.log(`   ✅ Created ${cars.length} cars`);
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();