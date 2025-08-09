const db = require('../config/db');

async function getCategory() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM categoria', (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

async function addCategory( category ) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO categoria ( description) VALUES (?, ?)';
        db.query(query, [category.name], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId);
        });
    }); 
}

async function deleteCategory(category) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM categoria WHERE id = ?';
        db.query(query, [category.id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.affectedRows);
        });
    });
}

async function updateCategory(category) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE categoria SET description = ? WHERE id = ?';
        db.query(query, [category.name, category.id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.affectedRows);
        });
    });
}

module.exports = {
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory
};
