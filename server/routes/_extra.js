// routes/users.js
const express = require('express');
const userRouter = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

userRouter.get('/notifications', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json({ success: true, notifications: user.notifications });
  } catch (error) { next(error); }
});

userRouter.put('/notifications/:notifId/read', protect, async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user.id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (error) { next(error); }
});

userRouter.put('/notifications/read-all', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = userRouter;

// ─────────────────────────────────────────────────────────────

// routes/admin.js
const adminRouter = express.Router();
const adminProtect = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

adminRouter.use(adminProtect.protect, adminProtect.authorize('admin'));
adminRouter.get('/dashboard', adminCtrl.getDashboardStats);
adminRouter.get('/users', adminCtrl.getAllUsers);
adminRouter.put('/users/:id', adminCtrl.updateUser);
adminRouter.get('/cars', adminCtrl.getAllCars);
adminRouter.put('/cars/:id/approve', adminCtrl.approveCar);
adminRouter.get('/bookings', adminCtrl.getAllBookings);

// ─────────────────────────────────────────────────────────────

// routes/ai.js
const aiRouter = express.Router();
const aiProtect = require('../middleware/auth');
const aiService = require('../services/aiService');

aiRouter.post('/chat', aiProtect.optionalAuth, aiService.chat);
aiRouter.post('/recommendations', aiProtect.optionalAuth, aiService.getRecommendations);

// Export all routers from this file for convenience
module.exports = { userRouter, adminRouter: adminRouter, aiRouter };
