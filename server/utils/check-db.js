require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carrental';

async function listAllCars() {
  try {
    await mongoose.connect(MONGODB_URI);
    const cars = await Car.find({});
    console.log(JSON.stringify(cars.map(c => ({ 
      id: c._id,
      name: c.name, 
      model: c.model, 
      imageUrl: c.images?.[0]?.url 
    })), null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listAllCars();
