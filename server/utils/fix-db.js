require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Car = mongoose.model('Car', new mongoose.Schema({ name: String, images: Array }));
  await Car.updateOne({ name: 'honda civic' }, { $set: { 'images.0.url': '/cars/honda-civic.jpg' } });
  console.log('Updated DB');
  process.exit();
});
