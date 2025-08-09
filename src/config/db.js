/*
const Pool = require('./pool');

const pool = new Pool({
    user: 'root',
    host: 'localhost',
    database: 'expenses',
    password: 'your_password',
    port: 5432,
})
*/

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost:3306',
    user: 'root',
    password: 'Isis1998',
    database: 'emk',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = connection;


