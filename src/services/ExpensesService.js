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
        const query = `INSERT INTO public.egreso(
	amount, descripcion, estado, transactiondate, paymentmethod, authorizationcode, merchant, "userId")
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8 );`;  
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