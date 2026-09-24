const crypto = require('crypto');
const { pool } = require('../config/database');

const dispatchWebhooks = async (event, payload) => {
  try {
    // 1. Fetch all active webhooks from the database
    const result = await pool.query('SELECT url, secret FROM webhooks WHERE is_active = true');
    const webhooks = result.rows;

    if (webhooks.length === 0) return;

    const payloadString = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });

    // 2. Loop through each webhook and send the payload asynchronously
    webhooks.forEach(async (webhook) => {
      // Generate an HMAC signature so the receiving server knows it actually came from us
      const signature = crypto.createHmac('sha256', webhook.secret).update(payloadString).digest('hex');

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': signature
          },
          body: payloadString
        });
        
        console.log(`✅ Webhook [${event}] dispatched to ${webhook.url} - Status: ${response.status}`);
      } catch (err) {
        console.error(`❌ Webhook failed for ${webhook.url}:`, err.message);
      }
    });
  } catch (error) {
    console.error('Error dispatching webhooks:', error);
  }
};

module.exports = { dispatchWebhooks };