const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER, // Por defecto: postgres
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 5432, 
});

module.exports = pool;