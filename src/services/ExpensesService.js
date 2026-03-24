import pool  from '../config/db.js';

async function getExpensesByUserId(userId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM egreso WHERE "userId" = $1', [userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

async function getExpensesByUserIdAndDateRange(userId, startDate, endDate) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM egreso WHERE "userId" = $1 AND transactiondate >= $2 AND transactiondate <= $3`;
        pool.query(query, [userId, startDate, endDate], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}


async function addExpense(expense) {
    console.log(expense);
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO public.egreso(
	amount, descripcion, estado, transactiondate, paymentmethod, authorizationcode, merchant, "userId")
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8 );`;
        pool.query(query, [
                expense.amount,
                expense.description,
                expense.state,
                expense.transactionDate,
                expense.paymentMethod,
                expense.authorizationCode,
                expense.merchant,
                expense.userId
            ], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId);
        }
    );
    });
}

export {
    getExpensesByUserId,
    getExpensesByUserIdAndDateRange,
    addExpense
};