const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const crypto = require('crypto');

// POST /api/v1/webhooks - Register a new webhook listener
router.post('/', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Webhook URL is required' });
  }

  // Generate a secure signing secret for this specific client
  const secret = crypto.randomBytes(32).toString('hex');

  try {
    const result = await pool.query(
      `INSERT INTO webhooks (url, secret) VALUES ($1, $2) RETURNING id, url, secret, is_active`,
      [url, secret]
    );
    
    res.status(201).json({ 
      message: 'Webhook registered successfully', 
      webhook: result.rows[0] 
    });
  } catch (error) {
    console.error('Error registering webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;