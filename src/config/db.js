const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',      // ✅ Solo el nombre o la IP
  port: 3306,              // ✅ Puerto en parámetro separado
  user: 'root',
  password: 'Isis1998',
  database: 'emk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


module.exports = pool;


