const express = require('express');
const router = express.Router();
const { redisClient } = require('../config/redis');

// POST /api/v1/fleet/:driver_id/location - Update driver coordinates
router.post('/:driver_id/location', async (req, res) => {
  const { driver_id } = req.params;
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude (lat) and longitude (lng) are required' });
  }

  try {
    const locationData = JSON.stringify({ 
      lat, 
      lng, 
      updated_at: new Date().toISOString() 
    });
    
    // Save to Redis with an expiration of 5 minutes (300 seconds)
    // If the driver loses connection, we don't want to serve stale data forever
    await redisClient.set(`driver:${driver_id}:location`, locationData, {
      EX: 300 
    });

    res.status(200).json({ message: 'Location updated' });
  } catch (error) {
    console.error('Redis save error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// GET /api/v1/fleet/:driver_id/location - Get latest driver coordinates
router.get('/:driver_id/location', async (req, res) => {
  const { driver_id } = req.params;

  try {
    const locationData = await redisClient.get(`driver:${driver_id}:location`);
    
    if (!locationData) {
      return res.status(404).json({ error: 'Location not found or driver is offline' });
    }

    res.status(200).json(JSON.parse(locationData));
  } catch (error) {
    console.error('Redis fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

module.exports = router;