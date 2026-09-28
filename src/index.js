const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./config/database');
const { redisClient, connectRedis } = require('./config/redis');
const orderRoutes = require('./routes/orders');
const fleetRoutes = require('./routes/fleet');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/fleet', fleetRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Reject if a dependency doesn't answer in time (e.g. Redis queues commands while reconnecting)
const withTimeout = (promise, ms = 2000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms).unref()),
  ]);

// Health Check Endpoint - verifies the API can reach both data stores
app.get('/health', async (req, res) => {
  const [database, redis] = await Promise.allSettled([
    withTimeout(pool.query('SELECT 1')),
    withTimeout(redisClient.ping()),
  ]);

  const services = {
    database: database.status === 'fulfilled' ? 'OK' : 'DOWN',
    redis: redis.status === 'fulfilled' ? 'OK' : 'DOWN',
  };
  const healthy = Object.values(services).every((s) => s === 'OK');

  res.status(healthy ? 200 : 503).json({ status: healthy ? 'OK' : 'DEGRADED', services });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Catches malformed JSON bodies and any unhandled route errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
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
