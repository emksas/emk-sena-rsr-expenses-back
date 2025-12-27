import db from "../config/";

async function getExpenses() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM egreso', (error, results) => {
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
        const query = 'INSERT INTO egreso ( valor, descripcion, estado, idPlanificacion, cuentaContable_id) VALUES (?, ?, ?, ?, ?)';  
        db.query(query, [expense.amount, expense.description, expense.state, expense.idPlanification, expense.accountId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId);
        }
    );
    });
}

export {
    getExpenses,
    addExpense
};