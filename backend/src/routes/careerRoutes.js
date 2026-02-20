const express = require('express');
const router = express.Router();
const { getCareerMetrics } = require('../controllers/careerController');

// GET /api/career/metrics
router.get('/metrics', getCareerMetrics);

module.exports = router;
