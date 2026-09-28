const crypto = require('crypto');
const { pool } = require('../config/database');

// Don't let a slow subscriber hold a connection open indefinitely
const WEBHOOK_TIMEOUT_MS = 5000;

const sendWebhook = async (webhook, event, payloadString) => {
  // HMAC signature so the receiving server can verify the payload came from us
  const signature = crypto.createHmac('sha256', webhook.secret).update(payloadString).digest('hex');

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
      },
      body: payloadString,
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (response.ok) {
      console.log(`✅ Webhook [${event}] dispatched to ${webhook.url} - Status: ${response.status}`);
    } else {
      console.error(`❌ Webhook [${event}] rejected by ${webhook.url} - Status: ${response.status}`);
    }
  } catch (err) {
    console.error(`❌ Webhook failed for ${webhook.url}:`, err.message);
  }
};

const dispatchWebhooks = async (event, payload) => {
  try {
    const { rows: webhooks } = await pool.query(
      'SELECT url, secret FROM webhooks WHERE is_active = true'
    );

    if (webhooks.length === 0) return;

    const payloadString = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });

    await Promise.allSettled(webhooks.map((webhook) => sendWebhook(webhook, event, payloadString)));
  } catch (error) {
    console.error('Error dispatching webhooks:', error);
  }
};

module.exports = { dispatchWebhooks };
