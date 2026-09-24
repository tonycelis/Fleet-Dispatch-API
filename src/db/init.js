// We import 'pool' using the exact same name it was exported with
const { pool } = require('../config/database');

const createTables = async () => {
  console.log('Attempting to connect and create tables...');
  
  const queryText = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_reference VARCHAR(100) UNIQUE NOT NULL,
      status VARCHAR(50) DEFAULT 'CREATED',
      pickup_address TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      assigned_driver_id VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      secret VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    // This is where it was failing because pool was undefined
    await pool.query(queryText);
    console.log('Database tables initialized successfully!');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
};

createTables();