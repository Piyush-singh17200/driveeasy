const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  totalDays: {
    type: Number,
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  taxes: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentId: String,
  pickupLocation: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  dropoffLocation: {
    address: String,
    city: String,
  },
  specialRequests: String,
  driverLicense: {
    number: String,
    expiryDate: Date,
    verified: { type: Boolean, default: false },
  },
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Validate end date is after start date
bookingSchema.pre('validate', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Calculate totals before saving
bookingSchema.pre('save', function (next) {
  if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('pricePerDay')) {
    const msPerDay = 1000 * 60 * 60 * 24;
    this.totalDays = Math.ceil((this.endDate - this.startDate) / msPerDay);
    this.subtotal = this.totalDays * this.pricePerDay;
    this.taxes = Math.round(this.subtotal * 0.18); // 18% GST
    this.totalAmount = this.subtotal + this.taxes;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
