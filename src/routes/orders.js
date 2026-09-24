const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const crypto = require('crypto'); // Built-in Node module for generating random IDs

// POST /api/v1/orders - Create a new dispatch order
router.post('/', async (req, res) => {
  const { pickup_address, delivery_address } = req.body;
  
  // Basic validation
  if (!pickup_address || !delivery_address) {
    return res.status(400).json({ error: 'pickup_address and delivery_address are required' });
  }

  // Generate a unique tracking ID (e.g., ORD-8F2A9B)
  const order_reference = `ORD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  try {
    const result = await pool.query(
      `INSERT INTO orders (order_reference, pickup_address, delivery_address, status) 
       VALUES ($1, $2, $3, 'CREATED') RETURNING *`,
      [order_reference, pickup_address, delivery_address]
    );
    
    res.status(201).json({
      message: 'Order created successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;