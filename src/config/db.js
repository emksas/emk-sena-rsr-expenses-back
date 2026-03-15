const { Pool } = require('pg');

console.log( "Database configuration - DB_USER:", process.env.DB_USER);
console.log( "Database configuration - DB_HOST:", process.env.DB_HOST);
console.log( "Database configuration - DB_NAME:", process.env.DB_NAME);
console.log( "Database configuration - DB_PASSWORD:", process.env.DB_PASSWORD ? "****" : "Not Set");
console.log( "Database configuration - DB_PORT:", process.env.DB_PORT);


const pool = new Pool({
  user: process.env.DB_USER, // Por defecto: postgres
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 5432, 
});

export default pool;