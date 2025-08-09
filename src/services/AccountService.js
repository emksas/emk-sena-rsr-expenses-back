const db = require('../config/db');

async function getAccounts() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM cuenta', (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

async function addAccount(account) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO cuenta (description) VALUES (?)';    
        db.query(query, [account.description], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId);
        });
    });
}

async function deleteAccount(account) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM cuenta WHERE id = ?';   
        db.query(query, [account.id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.affectedRows);
        });
    });
}

async function updateAccount(account) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE cuenta SET description = ? WHERE id = ?';
        db.query(query, [account.description, account.id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.affectedRows);
        });
    });
}

module.exports = {
    getAccounts,
    addAccount,
    deleteAccount,
    updateAccount
};