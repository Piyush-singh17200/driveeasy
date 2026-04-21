const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/notifications', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json({ success: true, notifications: user.notifications });
  } catch (error) { next(error); }
});

router.put('/notifications/:notifId/read', protect, async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user.id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.put('/notifications/read-all', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;
