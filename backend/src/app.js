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

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(logger);

const frontendPath = path.resolve(__dirname, '../../frontend');
console.log(`📂 Frontend Path resolved: ${frontendPath}`);

// Serve index.html for the root path explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', protectedRoutes);

// Serve static frontend files
app.use(express.static(frontendPath));

app.use(errorHandler);

module.exports = app;
