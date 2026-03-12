const express = require('express');
const router = express.Router();
const { getCareerMetrics } = require('../controllers/careerController');
const { getLearningPath } = require('../controllers/learningPathController');

// GET /api/career/metrics
router.get('/metrics', getCareerMetrics);

// GET /api/career/learning-path/:role
router.get('/learning-path/:role', getLearningPath);

module.exports = router;
