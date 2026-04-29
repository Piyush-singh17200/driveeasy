const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: null,
  },
  phone: {
  type: String,
  trim: true,
  validate: {
    validator: function(v) {
      if (!v) return true;
      return /^[6-9]\d{9}$/.test(v);
    },
    message: 'Phone number must be 10 digits starting with 6-9'
  }
},
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  preferences: {
    carTypes: [String],
    maxBudget: Number,
    locations: [String],
  },
  notifications: [{
    message: String,
    type: { type: String, enum: ['booking', 'payment', 'system', 'promotion'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loginOTP: String,
  loginOTPExpire: Date,
  lastLogin: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.loginOTP;
  delete obj.loginOTPExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
