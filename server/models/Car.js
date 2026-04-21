const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Invalid year'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van', 'Truck', 'Convertible'],
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic', 'CVT'],
    required: true,
  },
  fuel: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
    required: true,
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 15,
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [100, 'Minimum price is ₹100/day'],
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  images: [{
    url: { type: String, required: true },
    publicId: String,
    isPrimary: { type: Boolean, default: false },
  }],
  features: [String],
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  bookedDates: [{
    startDate: Date,
    endDate: Date,
    bookingId: mongoose.Schema.Types.ObjectId,
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  mileage: String,
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
  },
  views: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Indexes for performance
carSchema.index({ 'location.city': 1 });
carSchema.index({ category: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ isAvailable: 1, isApproved: 1 });
carSchema.index({ owner: 1 });

// Virtual for primary image
carSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || null);
});

module.exports = mongoose.model('Car', carSchema);
