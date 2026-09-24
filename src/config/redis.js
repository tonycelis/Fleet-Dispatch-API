const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Redis v4+ requires explicit connection
const connectRedis = async () => {
  await redisClient.connect();
};

module.exports = { redisClient, connectRedis };