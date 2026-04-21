const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  aspects: {
    cleanliness: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    performance: { type: Number, min: 1, max: 5 },
  },
  ownerResponse: {
    comment: String,
    respondedAt: Date,
  },
  isVerified: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Update car rating after review save
reviewSchema.post('save', async function () {
  const Car = mongoose.model('Car');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { car: this.car } },
    { $group: { _id: '$car', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Car.findByIdAndUpdate(this.car, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
