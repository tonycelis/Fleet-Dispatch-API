const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../config/database');
const { dispatchWebhooks } = require('../services/webhookService');

const ORDER_STATUSES = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

// POST /api/v1/orders - Create a new dispatch order
router.post('/', async (req, res) => {
  const { pickup_address, delivery_address } = req.body ?? {};

  if (!pickup_address || !delivery_address) {
    return res.status(400).json({ error: 'pickup_address and delivery_address are required' });
  }

  const order_reference = `ORD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  try {
    const result = await pool.query(
      `INSERT INTO orders (order_reference, pickup_address, delivery_address, status)
       VALUES ($1, $2, $3, 'CREATED') RETURNING *`,
      [order_reference, pickup_address, delivery_address]
    );

    res.status(201).json({ message: 'Order created', order: result.rows[0] });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/orders/:id/status - Update order status and trigger webhooks
router.patch('/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Order id must be a positive integer' });
  }

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ORDER_STATUSES.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = result.rows[0];

    // Fire-and-forget: don't make the client wait on third-party endpoints
    dispatchWebhooks('order.status_changed', updatedOrder);

    res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
