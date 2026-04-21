const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { chat, getRecommendations } = require('../services/aiService');

router.post('/chat', optionalAuth, chat);
router.post('/recommendations', optionalAuth, getRecommendations);

module.exports = router;
