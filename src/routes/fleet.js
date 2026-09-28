const express = require('express');
const router = express.Router();
const { redisClient } = require('../config/redis');

// If the driver loses connection, we don't want to serve stale data forever
const LOCATION_TTL_SECONDS = 300;

const locationKey = (driverId) => `driver:${driverId}:location`;

const isValidCoordinate = (value, limit) =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;

// POST /api/v1/fleet/:driver_id/location - Update driver coordinates
router.post('/:driver_id/location', async (req, res) => {
  const { driver_id } = req.params;
  const { lat, lng } = req.body ?? {};

  if (!isValidCoordinate(lat, 90) || !isValidCoordinate(lng, 180)) {
    return res.status(400).json({
      error: 'lat (-90 to 90) and lng (-180 to 180) are required numeric values',
    });
  }

  try {
    const locationData = JSON.stringify({
      lat,
      lng,
      updated_at: new Date().toISOString(),
    });

    await redisClient.set(locationKey(driver_id), locationData, { EX: LOCATION_TTL_SECONDS });

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
    const locationData = await redisClient.get(locationKey(driver_id));

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
