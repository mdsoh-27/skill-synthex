const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadResume } = require('../controllers/resumeController');

router.post('/upload', auth, upload.single('resume'), uploadResume);

module.exports = router;
