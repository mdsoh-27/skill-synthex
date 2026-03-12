require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const protectedRoutes = require('./routes/protectedRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const authRoutes = require('./routes/authRoutes');
const careerRoutes = require('./routes/careerRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(logger);

const frontendPath = path.resolve(__dirname, '../../frontend/dist');
console.log(`🚀 Serving Production React Build from: ${frontendPath}`);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api', protectedRoutes);

// Serve static frontend files (Vite Build)
app.use(express.static(frontendPath));

// 🔄 SPA Fallback: Serve index.html for any unmatched routes (Express 5 Safe)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(errorHandler);

module.exports = app;
