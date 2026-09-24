const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const orderRoutes = require('./routes/orders');

// Register Routes
app.use('/api/v1/orders', orderRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Fleet Dispatch API is running on http://localhost:${PORT}`);
});