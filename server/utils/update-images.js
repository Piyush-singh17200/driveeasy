require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

const updates = [
  { model: 'Swift ZXi+', name: 'Maruti Suzuki Swift ZXi+', url: '/cars/maruti-swift.jpg' },
  { model: 'Innova Crysta GX', name: 'Toyota Innova Crysta GX', url: '/cars/toyota-innova-crysta.jpg' },
  { model: 'Creta SX', name: 'Hyundai Creta SX', url: '/cars/hyundai-creta.jpg' },
  { model: 'Nexon EV Max', name: 'Tata Nexon EV Max', url: '/cars/tata-nexon-ev.jpg' },
  { model: '530d M Sport', name: 'BMW 5 Series 530d M Sport', url: '/cars/bmw-5-series.jpg' },
  { model: 'Thar LX', name: 'Mahindra Thar LX 4x4', url: '/cars/mahindra-thar.jpg' },
  { model: 'City 5th Gen', name: 'Honda City 5th Gen', url: '/cars/honda-city.jpg' },
  { model: 'Seltos HTX+', name: 'Kia Seltos HTX+', url: '/cars/kia-seltos.jpg' },
  { model: 'C 200', name: 'Mercedes-Benz C 200', url: '/cars/mercedes-c-class.jpg' },
  { model: 'A4 Premium Plus', name: 'Audi A4 Premium Plus', url: '/cars/audi-a4.jpg' },
  { model: 'Baleno Alpha', name: 'Maruti Suzuki Baleno Alpha', url: '/cars/maruti-baleno.jpg' },
  { model: 'Fortuner Legender', name: 'Toyota Fortuner Legender 4x4', url: '/cars/toyota-fortuner-legender.jpg' },
  { model: 'Verna SX Turbo', name: 'Hyundai Verna SX Turbo', url: '/cars/hyundai-verna.jpg' },
  { model: 'Scorpio-N Z8L', name: 'Mahindra Scorpio-N Z8L', url: '/cars/mahindra-scorpio-n.jpg' },
  { model: 'Hector Plus Sharp Pro', name: 'MG Hector Plus Sharp Pro', url: '/cars/mg-hector-plus.jpg' },
  { model: 'Cayenne S', name: 'Porsche Cayenne S', url: '/cars/porsche-cayenne.jpg' },
  { model: 'Punch EV Empowered', name: 'Tata Punch EV Empowered', url: '/cars/tata-punch-ev.jpg' },
  { model: 'Range Rover Sport HSE', name: 'Range Rover Sport HSE', url: '/cars/range-rover-sport.jpg' },
  { model: 'Jazz VX CVT', name: 'Honda Jazz VX CVT', url: '/cars/honda-jazz.jpg' },
  { model: 'Carnival Limousine Plus', name: 'Kia Carnival Limousine Plus', url: '/cars/kia-carnival.jpg' },
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
