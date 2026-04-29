const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

async function verifyImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    const cars = await Car.find({});
    console.log(`Checking ${cars.length} cars...`);

    for (const car of cars) {
      const url = car.images?.[0]?.url;
      if (!url) {
        console.log(`❌ ${car.name}: No image URL`);
        continue;
      }

      if (url.startsWith('file:///')) {
        console.log(`✅ ${car.name}: Local file (assumed ok) - ${url}`);
        continue;
      }

      try {
        const response = await axios.head(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log(`✅ ${car.name}: ${response.status} - ${url}`);
      } catch (error) {
        console.log(`❌ ${car.name}: FAILED (${error.message}) - ${url}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyImages();
