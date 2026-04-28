require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

const updates = [
  { model: 'Swift ZXi+', name: 'Maruti Suzuki Swift ZXi+', url: '/cars/swift.png' },
  { model: 'Innova Crysta', name: 'Toyota Innova Crysta Luxury', url: '/cars/innova.png' },
  { model: 'Creta SX', name: 'Hyundai Creta SX (Knight Edition)', url: '/cars/creta.png' },
  { model: 'Nexon EV Max', name: 'Tata Nexon EV Max', url: '/cars/nexon.png' },
  { model: '530d M Sport', name: 'BMW 5 Series 530d M Sport', url: '/cars/bmw.png' },
  { model: 'Thar LX', name: 'Mahindra Thar LX 4x4', url: '/cars/thar.png' },
  { model: 'City 5th Gen', name: 'Honda City 5th Gen', url: '/cars/honda.png' },
  { model: 'Seltos HTX+', name: 'Kia Seltos HTX+', url: 'https://imgd.aeplcdn.com/1200x900/n/cw/ec/144163/seltos-exterior-right-front-three-quarter.jpeg' },
];

async function updateImages() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    for (const update of updates) {
      console.log(`Updating ${update.model}...`);
      const result = await Car.updateOne(
        { model: update.model },
        { 
          $set: { 
            name: update.name,
            'images.0.url': update.url 
          } 
        }
      );
      if (result.matchedCount > 0) {
        console.log(`   ✅ Updated ${update.model}`);
      } else {
        console.log(`   ⚠️  No car found with model ${update.model}`);
      }
    }

    console.log('🎉 Update completed successfully!');
  } catch (error) {
    console.error('❌ Update error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateImages();
