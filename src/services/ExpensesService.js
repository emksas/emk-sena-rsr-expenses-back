const db = require('../config/db');

async function getExpenses() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM egreso', (error, results) => {
            
            console.log('Results:', results);

            console.log('Error:', error);
            
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

async function addExpense(expense) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)';  
        db.query(query, [expense.description, expense.amount, expense.date], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId);
        }
    );
    });
}

module.exports = {
    getExpenses,
};