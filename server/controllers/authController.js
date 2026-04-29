const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { createAuditLog } = require('../services/auditService');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token, user });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const phone = req.body.phone ? String(req.body.phone).replace(/\D/g, '') : undefined;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Validate email format strictly
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Please provide a valid email address' });
}

// Block fake/disposable emails
const blockedDomains = ['test.com', 'fake.com', 'temp.com', 'throwaway.com'];
const emailDomain = email.split('@')[1];
if (blockedDomains.includes(emailDomain)) {
  return res.status(400).json({ error: 'Please use a valid email address' });
}
if (phone && !/^[6-9]\d{9}$/.test(phone)) {
  return res.status(400).json({ error: 'Phone must be exactly 10 digits starting with 6, 7, 8, or 9' });
}

    const allowedRoles = ['user', 'owner'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({ name, email, password, role: userRole, phone });

    await createAuditLog({
      userId: user._id.toString(),
      action: 'REGISTER',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.loginOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send email without awaiting to prevent hanging the request
    sendEmail({
      to: email,
      subject: 'Welcome to DriveEasy! Verify your Email',
      template: 'otp', // fallback to text if missing
      text: `Welcome to DriveEasy! Your OTP is: ${otp}. It will expire in 10 minutes.`,
      data: { name, otp },
    })
      .then(() => logger.info(`[Development] Registration OTP for ${user.email} is: ${otp}`))
      .catch(err => {
        logger.error('Registration email failed:', err);
        logger.info(`[Development Fallback] Registration OTP for ${user.email} is: ${otp}`);
      });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. OTP sent to your email.',
      requiresOTP: true,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated. Contact support.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.loginOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send OTP via email without awaiting to prevent hanging
    sendEmail({
      to: user.email,
      subject: 'Your Login OTP',
      template: 'otp', // Assuming a basic text fallback if template is missing
      text: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`,
      data: { name: user.name, otp },
    })
      .then(() => logger.info(`[Development] OTP for ${user.email} is: ${otp}`))
      .catch(err => {
        logger.error('Failed to send OTP email:', err);
        logger.info(`[Development Fallback] OTP for ${user.email} is: ${otp}`);
      });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to continue.',
      requiresOTP: true,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Please provide email and OTP' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({
      email,
      loginOTP: hashedOTP,
      loginOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.loginOTP = undefined;
    user.loginOTPExpire = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      userId: user._id.toString(),
      action: 'LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      preferences: req.body.preferences,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, a password reset OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    sendEmail({
      to: user.email,
      subject: 'Your Password Reset OTP',
      template: 'otp',
      data: { name: user.name, otp },
    })
      .then(() => logger.info(`[Development] Reset OTP for ${user.email} is: ${otp}`))
      .catch(err => {
        logger.error('Failed to send reset OTP email:', err);
        logger.info(`[Development Fallback] Reset OTP for ${user.email} is: ${otp}`);
      });

    res.json({ success: true, message: 'If that email is registered, a password reset OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
