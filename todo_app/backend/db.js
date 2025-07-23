const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT), // 🔥 Ensure it's a number, not string
  database: process.env.DB_NAME,
  ssl: {
    require: true,                // ✅ Required for SSL
    rejectUnauthorized: false     // ✅ Accept Render's self-signed cert
  },
});

// Check connection
pool.connect()
  .then(() => console.log('✅ PostgreSQL Connected Successfully'))
  .catch((err) => console.error('❌ PostgreSQL Connection Error:', err));

module.exports = pool;
