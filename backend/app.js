const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { errorHandler, AppError } = require('./middleware/error.middleware');
const mysql = require('./config/db.mysql');
const mongoose = require('mongoose');

const app = express();

// Ensure resume upload directory exists on startup (works with mounted volumes)
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  let mysqlStatus = 'disconnected';
  try {
    mysqlStatus = await mysql.checkHealth();
  } catch (e) {
    mysqlStatus = 'error: ' + e.message;
  }

  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mysql: mysqlStatus,
      mongodb: mongoStatus
    }
  });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Catch unknown /api/* routes with JSON 404
app.use('/api/*', (req, res, next) => {
  next(new AppError(`Endpoint ${req.originalUrl} not found on this server`, 404));
});

// Serve built React frontend in production/all-in-one deployments when present
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  // Dev API-only welcome endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Recruitment Portal API',
      version: '1.0.0',
      documentation: '/api',
      health: '/api/health'
    });
  });

  // Catch 404 routes
  app.use('*', (req, res, next) => {
    next(new AppError(`Endpoint ${req.originalUrl} not found on this server`, 404));
  });
}

// Centralized error handling
app.use(errorHandler);

module.exports = app;
