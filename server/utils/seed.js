require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

const seedUsers = [
  { name: 'Admin User', email: 'admin@demo.com', password: 'Admin1234', role: 'admin', isVerified: true, isActive: true },
  { name: 'John Owner', email: 'owner@demo.com', password: 'Demo1234', role: 'owner', phone: '9876543210', isVerified: true, isActive: true },
  { name: 'Priya User', email: 'user@demo.com', password: 'Demo1234', role: 'user', phone: '8765432109', isVerified: true, isActive: true },
  { name: 'Rahul Sharma', email: 'rahul@demo.com', password: 'Demo1234', role: 'owner', phone: '7654321098', isVerified: true, isActive: true },
];

const seedCars = (ownerIds) => [
  {
    owner: ownerIds[0], name: 'Maruti Suzuki Swift ZXi+', brand: 'Maruti Suzuki', model: 'Swift ZXi+',
    year: 2023, category: 'Hatchback', transmission: 'Manual', fuel: 'Petrol', seats: 5,
    pricePerDay: 1200, location: { city: 'Mumbai', state: 'Maharashtra', address: 'Bandra West' },
    images: [{ url: '/cars/maruti-swift.jpg', isPrimary: true }],
    features: ['AC', 'Bluetooth', 'Reverse Camera', 'Power Windows', 'ABS'],
    description: 'Brand new Swift — perfect city car with great mileage of 22 kmpl.',
    isAvailable: true, isApproved: true, mileage: '22 kmpl', rating: { average: 4.5, count: 12 },
  },
  {
    owner: ownerIds[0], name: 'Toyota Innova Crysta GX', brand: 'Toyota', model: 'Innova Crysta GX',
    year: 2022, category: 'Van', transmission: 'Automatic', fuel: 'Diesel', seats: 7,
    pricePerDay: 3500, location: { city: 'Mumbai', state: 'Maharashtra', address: 'Andheri East' },
    images: [{ url: '/cars/toyota-innova-crysta.jpg', isPrimary: true }],
    features: ['AC', 'Leather Seats', 'Push Button Start', 'Rear AC', 'USB Ports'],
    description: '7-seater MPV — great for family trips and airport transfers.',
    isAvailable: true, isApproved: true, mileage: '14 kmpl', rating: { average: 4.8, count: 28 },
  },
  {
    owner: ownerIds[1], name: 'Hyundai Creta SX', brand: 'Hyundai', model: 'Creta SX',
    year: 2023, category: 'SUV', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 2800, location: { city: 'Bangalore', state: 'Karnataka', address: 'Koramangala' },
    images: [{ url: '/cars/hyundai-creta.jpg', isPrimary: true }],
    features: ['Panoramic Sunroof', 'Ventilated Seats', 'BOSE Sound', 'BlueLink'],
    description: 'Top-spec Creta with panoramic sunroof — best SUV under 3000.',
    isAvailable: true, isApproved: true, mileage: '16 kmpl', rating: { average: 4.7, count: 19 },
  },
  {
    owner: ownerIds[1], name: 'Tata Nexon EV Max', brand: 'Tata', model: 'Nexon EV Max',
    year: 2023, category: 'Electric', transmission: 'Automatic', fuel: 'Electric', seats: 5,
    pricePerDay: 2200, location: { city: 'Pune', state: 'Maharashtra', address: 'Wakad' },
    images: [{ url: '/cars/tata-nexon-ev.jpg', isPrimary: true }],
    features: ['400km Range', 'Fast Charging', 'ADAS Suite', 'Harman Audio'],
    description: 'Go green — 400km range on single charge. Save fuel costs!',
    isAvailable: true, isApproved: true, mileage: '437 km/charge', rating: { average: 4.6, count: 15 },
  },
  {
    owner: ownerIds[0], name: 'BMW 5 Series 530d M Sport', brand: 'BMW', model: '530d M Sport',
    year: 2022, category: 'Luxury', transmission: 'Automatic', fuel: 'Diesel', seats: 5,
    pricePerDay: 8500, location: { city: 'Delhi', state: 'Delhi', address: 'Connaught Place' },
    images: [{ url: '/cars/bmw-5-series.jpg', isPrimary: true }],
    features: ['Leather Interior', 'Heads-Up Display', 'Parking Assistant', 'Adaptive Cruise'],
    description: 'Ultimate luxury sedan — perfect for business travel in Delhi.',
    isAvailable: true, isApproved: true, mileage: '17 kmpl', rating: { average: 4.9, count: 8 },
  },
  {
    owner: ownerIds[1], name: 'Mahindra Thar LX 4x4', brand: 'Mahindra', model: 'Thar LX',
    year: 2023, category: 'SUV', transmission: 'Manual', fuel: 'Diesel', seats: 4,
    pricePerDay: 3200, location: { city: 'Goa', state: 'Goa', address: 'Panjim' },
    images: [{ url: '/cars/mahindra-thar.jpg', isPrimary: true }],
    features: ['4x4 Drive', 'Convertible Top', 'Snorkel', 'Rock Crawling Mode'],
    description: 'Perfect for Goa beach drives and off-road adventures!',
    isAvailable: true, isApproved: true, mileage: '15 kmpl', rating: { average: 4.7, count: 23 },
  },
  {
    owner: ownerIds[0], name: 'Honda City 5th Gen', brand: 'Honda', model: 'City 5th Gen',
    year: 2022, category: 'Sedan', transmission: 'CVT', fuel: 'Petrol', seats: 5,
    pricePerDay: 1800, location: { city: 'Chennai', state: 'Tamil Nadu', address: 'Anna Nagar' },
    images: [{ url: '/cars/honda-city.jpg', isPrimary: true }],
    features: ['Honda Sensing', 'Wireless Carplay', 'LaneWatch', 'LKAS'],
    description: 'Reliable and fuel-efficient sedan with advanced safety features.',
    isAvailable: true, isApproved: true, mileage: '18 kmpl', rating: { average: 4.4, count: 31 },
  },
  {
    owner: ownerIds[1], name: 'Kia Seltos HTX+', brand: 'Kia', model: 'Seltos HTX+',
    year: 2023, category: 'SUV', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 2400, location: { city: 'Hyderabad', state: 'Telangana', address: 'Madhapur' },
    images: [{ url: '/cars/kia-seltos.jpg', isPrimary: true }],
    features: ['10.25" Touchscreen', 'Bose Sound', 'ADAS', 'OTA Updates', 'Sunroof'],
    description: 'Feature-packed SUV with segment-best tech and comfort.',
    isAvailable: true, isApproved: true, mileage: '16 kmpl', rating: { average: 4.5, count: 17 },
  },
  {
    owner: ownerIds[0], name: 'Mercedes-Benz C 200', brand: 'Mercedes-Benz', model: 'C 200',
    year: 2023, category: 'Luxury', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 9500, location: { city: 'Mumbai', state: 'Maharashtra', address: 'Worli' },
    images: [{ url: '/cars/mercedes-c-class.jpg', isPrimary: true }],
    features: ['MBUX Infotainment', 'Burmester Sound', 'Driver Assistance', 'AMG Line'],
    description: 'The iconic Mercedes C-Class — elegance meets performance.',
    isAvailable: true, isApproved: true, mileage: '13 kmpl', rating: { average: 4.9, count: 6 },
  },
  {
    owner: ownerIds[1], name: 'Audi A4 Premium Plus', brand: 'Audi', model: 'A4 Premium Plus',
    year: 2022, category: 'Luxury', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 9000, location: { city: 'Bangalore', state: 'Karnataka', address: 'Indiranagar' },
    images: [{ url: '/cars/audi-a4.jpg', isPrimary: true }],
    features: ['MMI Navigation', 'Bang & Olufsen Audio', 'Matrix LED', 'Virtual Cockpit'],
    description: 'Audi A4 — the perfect blend of luxury and sportiness.',
    isAvailable: true, isApproved: true, mileage: '14 kmpl', rating: { average: 4.8, count: 9 },
  },
  {
    owner: ownerIds[0], name: 'Maruti Suzuki Baleno Alpha', brand: 'Maruti Suzuki', model: 'Baleno Alpha',
    year: 2023, category: 'Hatchback', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 1400, location: { city: 'Pune', state: 'Maharashtra', address: 'Hinjewadi' },
    images: [{ url: '/cars/maruti-baleno.jpg', isPrimary: true }],
    features: ['Heads-Up Display', '360 Camera', 'Wireless Charging', 'SmartPlay Pro+'],
    description: 'Premium hatchback with HUD — tech-loaded at an affordable price.',
    isAvailable: true, isApproved: true, mileage: '22 kmpl', rating: { average: 4.4, count: 22 },
  },
  {
    owner: ownerIds[1], name: 'Toyota Fortuner Legender 4x4', brand: 'Toyota', model: 'Fortuner Legender',
    year: 2022, category: 'SUV', transmission: 'Automatic', fuel: 'Diesel', seats: 7,
    pricePerDay: 5500, location: { city: 'Delhi', state: 'Delhi', address: 'Dwarka' },
    images: [{ url: '/cars/toyota-fortuner-legender.jpg', isPrimary: true }],
    features: ['4x4 Drive', 'JBL Sound', 'Panoramic View Monitor', 'Adaptive Cruise'],
    description: 'The king of SUVs — Fortuner Legender in full glory.',
    isAvailable: true, isApproved: true, mileage: '14 kmpl', rating: { average: 4.8, count: 14 },
  },
  {
    owner: ownerIds[0], name: 'Hyundai Verna SX Turbo', brand: 'Hyundai', model: 'Verna SX Turbo',
    year: 2023, category: 'Sedan', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 2000, location: { city: 'Chennai', state: 'Tamil Nadu', address: 'OMR' },
    images: [{ url: '/cars/hyundai-verna.jpg', isPrimary: true }],
    features: ['1.5 Turbo Engine', 'ADAS Level 2', 'Bose Audio', 'Ventilated Seats'],
    description: 'New Verna with turbo power — sporty and premium.',
    isAvailable: true, isApproved: true, mileage: '20 kmpl', rating: { average: 4.5, count: 18 },
  },
  {
    owner: ownerIds[1], name: 'Mahindra Scorpio-N Z8L', brand: 'Mahindra', model: 'Scorpio-N Z8L',
    year: 2023, category: 'SUV', transmission: 'Automatic', fuel: 'Diesel', seats: 7,
    pricePerDay: 4000, location: { city: 'Jaipur', state: 'Rajasthan', address: 'Malviya Nagar' },
    images: [{ url: '/cars/mahindra-scorpio-n.jpg', isPrimary: true }],
    features: ['Sony Audio', 'AdrenoX System', 'Air Purifier', 'Level 2 ADAS'],
    description: 'The Big Daddy of SUVs — Scorpio-N in top Z8L variant.',
    isAvailable: true, isApproved: true, mileage: '15 kmpl', rating: { average: 4.7, count: 21 },
  },
  {
    owner: ownerIds[0], name: 'MG Hector Plus Sharp Pro', brand: 'MG', model: 'Hector Plus Sharp Pro',
    year: 2023, category: 'SUV', transmission: 'Automatic', fuel: 'Petrol', seats: 6,
    pricePerDay: 3800, location: { city: 'Ahmedabad', state: 'Gujarat', address: 'SG Highway' },
    images: [{ url: '/cars/mg-hector-plus.jpg', isPrimary: true }],
    features: ['14" Touchscreen', 'Panoramic Sunroof', 'Captain Seats', 'i-SMART AI'],
    description: 'Connected SUV with India\'s largest touchscreen and AI assistant.',
    isAvailable: true, isApproved: true, mileage: '14 kmpl', rating: { average: 4.5, count: 13 },
  },
  {
    owner: ownerIds[1], name: 'Porsche Cayenne S', brand: 'Porsche', model: 'Cayenne S',
    year: 2022, category: 'Luxury', transmission: 'Automatic', fuel: 'Petrol', seats: 5,
    pricePerDay: 18000, location: { city: 'Mumbai', state: 'Maharashtra', address: 'Juhu' },
    images: [{ url: '/cars/porsche-cayenne.jpg', isPrimary: true }],
    features: ['Sport Chrono', 'PDCC', 'Bose Surround', 'Night Vision Assist'],
    description: 'The pinnacle of luxury SUVs — Porsche Cayenne S for the elite.',
    isAvailable: true, isApproved: true, mileage: '10 kmpl', rating: { average: 5.0, count: 4 },
  },
  {
    owner: ownerIds[0], name: 'Tata Punch EV Empowered', brand: 'Tata', model: 'Punch EV Empowered',
    year: 2024, category: 'Electric', transmission: 'Automatic', fuel: 'Electric', seats: 5,
    pricePerDay: 1600, location: { city: 'Bangalore', state: 'Karnataka', address: 'Whitefield' },
    images: [{ url: '/cars/tata-punch-ev.jpg', isPrimary: true }],
    features: ['421km Range', 'Vehicle-to-Load', 'Arcade.ev', 'Level 2 AC Charging'],
    description: 'Affordable electric with 421km range — perfect for daily commutes.',
    isAvailable: true, isApproved: true, mileage: '421 km/charge', rating: { average: 4.4, count: 11 },
  },
  {
    owner: ownerIds[1], name: 'Range Rover Sport HSE', brand: 'Land Rover', model: 'Range Rover Sport HSE',
    year: 2023, category: 'Luxury', transmission: 'Automatic', fuel: 'Diesel', seats: 5,
    pricePerDay: 15000, location: { city: 'Delhi', state: 'Delhi', address: 'South Extension' },
    images: [{ url: '/cars/range-rover-sport.jpg', isPrimary: true }],
    features: ['Terrain Response 2', 'Pivi Pro', 'Meridian Sound', 'Air Suspension'],
    description: 'The ultimate luxury SUV — Range Rover Sport for the discerning.',
    isAvailable: true, isApproved: true, mileage: '12 kmpl', rating: { average: 4.9, count: 7 },
  },
  {
    owner: ownerIds[0], name: 'Honda Jazz VX CVT', brand: 'Honda', model: 'Jazz VX CVT',
    year: 2022, category: 'Hatchback', transmission: 'CVT', fuel: 'Petrol', seats: 5,
    pricePerDay: 1500, location: { city: 'Hyderabad', state: 'Telangana', address: 'Gachibowli' },
    images: [{ url: '/cars/honda-jazz.jpg', isPrimary: true }],
    features: ['Magic Seats', 'Digipad 2.0', 'Honda Sensing', 'LED Headlamps'],
    description: 'Versatile hatchback with magic seats — maximizes space cleverly.',
    isAvailable: true, isApproved: true, mileage: '17 kmpl', rating: { average: 4.3, count: 25 },
  },
  {
    owner: ownerIds[1], name: 'Kia Carnival Limousine Plus', brand: 'Kia', model: 'Carnival Limousine Plus',
    year: 2023, category: 'Van', transmission: 'Automatic', fuel: 'Diesel', seats: 7,
    pricePerDay: 6500, location: { city: 'Chennai', state: 'Tamil Nadu', address: 'Nungambakkam' },
    images: [{ url: '/cars/kia-carnival.jpg', isPrimary: true }],
    features: ['VIP Lounge Seats', 'Bose Premium', 'Dual Sunroof', 'Rear Entertainment'],
    description: 'Luxury MPV with VIP seating — travel in absolute comfort.',
    isAvailable: true, isApproved: true, mileage: '13 kmpl', rating: { average: 4.8, count: 10 },
  },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');
    console.log('🗑️  Clearing existing data...');
    await Promise.all([User.deleteMany({}), Car.deleteMany({}), Booking.deleteMany({})]);
    console.log('👤 Creating users...');
    const users = await User.create(seedUsers);
    const ownerUsers = users.filter(u => u.role === 'owner');
    console.log(`   ✅ Created ${users.length} users`);
    console.log('🚗 Creating cars...');
    const cars = await Car.create(seedCars([ownerUsers[0]._id, ownerUsers[1]._id]));
    console.log(`   ✅ Created ${cars.length} cars`);
    console.log('\n🎉 Seed completed!');
    console.log(`   Users: ${users.length} | Cars: ${cars.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@demo.com / Admin1234');
    console.log('   Owner: owner@demo.com / Demo1234');
    console.log('   User:  user@demo.com / Demo1234');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
