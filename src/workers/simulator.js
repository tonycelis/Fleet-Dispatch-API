// A simple worker that simulates a driver moving through downtown Montreal
const DRIVER_ID = process.env.DRIVER_ID || 'driver-123';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api/v1/fleet/${DRIVER_ID}/location`;
const INTERVAL_MS = 3000;

// Starting coordinates
let currentLat = 45.5017;
let currentLng = -73.5673;

const moveDriver = async () => {
  // Add a small random jitter to simulate physical driving
  currentLat += (Math.random() - 0.5) * 0.001;
  currentLng += (Math.random() - 0.5) * 0.001;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: currentLat, lng: currentLng })
    });
    
    if (response.ok) {
      console.log(`📍 [${new Date().toLocaleTimeString()}] Driver moved to: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`);
    } else {
      console.error(`Failed to update location - API returned ${response.status}`);
    }
  } catch (error) {
    console.error('API connection error. Is the server running?', error.message);
  }
};

console.log(`🚗 Starting simulation for ${DRIVER_ID}...`);
console.log('Press Ctrl + C to stop the engine.');

// Ping the API every 3 seconds
setInterval(moveDriver, INTERVAL_MS);