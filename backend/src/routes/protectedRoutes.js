const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const quizController = require('../controllers/quizController');
const progressController = require('../controllers/progressController');
const analyticsController = require('../controllers/analyticsController');
const chatController = require('../controllers/chatController');

// Profile Routes
router.get('/profile', auth, profileController.getProfile);
router.put('/profile', auth, profileController.updateProfile);

// Quiz Routes
router.get('/quiz/:skill', auth, quizController.getQuestions);
router.post('/quiz/submit', auth, quizController.submitResult);

// Progress Routes
router.post('/progress/complete', auth, progressController.markComplete);
router.get('/progressData', auth, progressController.getProgress);

// Analytics Routes
router.get('/analytics', auth, analyticsController.getAnalytics);

// AI Chat Routes
router.post('/chat', auth, chatController.getChatResponse);


module.exports = router;
