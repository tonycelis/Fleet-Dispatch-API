const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./config/database');
const { connectRedis } = require('./config/redis');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const orderRoutes = require('./routes/orders');
const fleetRoutes = require('./routes/fleet');

// Register Routes
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/fleet', fleetRoutes);
app.use('/api/v1/webhooks', webhookRoutes);


// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Initialize Services and Start Server
const startServer = async () => {
  try {
    await connectRedis(); // Connect to Redis before starting the API
    app.listen(PORT, () => {
      console.log(`🚀 Fleet Dispatch API is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();