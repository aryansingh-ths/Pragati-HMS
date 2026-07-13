const { Pool } = require('pg');
require('dotenv').config();

// 1. Debugging step: Tell us if the .env file is actually being read
if (!process.env.DATABASE_URL) {
  console.log('⚠️ WARNING: .env file not found or DATABASE_URL is missing. Using fallback.');
} else {
  console.log('🟢 .env file loaded successfully!');
}

// 2. Use the env variable, OR the hardcoded string that works
// 🚨 IMPORTANT: Change YOUR_ACTUAL_PASSWORD below to your actual pgAdmin password
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Hms@techhansa@localhost:5432/hms_database';

const pool = new Pool({
  connectionString: connectionString,
  connectionTimeoutMillis: 5000, // Fail if cannot connect in 5 seconds
});

pool.on('connect', () => {
  console.log('✅ Successfully connected to the PostgreSQL database.');
  // connection established
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// 3. Force an immediate connection test on startup so we see the success message!
pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('❌ Failed to connect to the database on startup:', err.message);
  }
});

module.exports = pool;