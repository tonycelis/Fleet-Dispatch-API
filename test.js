const { Client } = require('pg');

console.log("1. Script started");

const client = new Client({
  connectionString: 'postgres://postgres:password@localhost:5432/fleet_db',
  connectionTimeoutMillis: 3000
});

async function runTest() {
  try {
    console.log("2. Attempting to connect...");
    await client.connect();
    console.log("3. Connected successfully!");
    
    const res = await client.query('SELECT NOW()');
    console.log("4. Database time:", res.rows[0]);
  } catch (err) {
    console.error("Error occurred:", err.message);
  } finally {
    await client.end();
    console.log("5. Connection closed.");
  }
}

runTest();