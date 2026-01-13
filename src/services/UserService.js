import db from "../config/";

async function getUserInformation() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM usuario', (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    }); 
}

async function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuario WHERE id = ?';
        db.query(query, [userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0]);
        }
    );
    });
}

async function createUserInformation(user) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO usuario ( nombre, email) VALUES (?, ?)';
        db.query(query, [user.nombre, user.email], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

export {
    getUserInformation, 
    getUserById,
    createUserInformation
};