import express from 'express';
import {getExpensesRappi} from '../controllers/ExpensesControllers.js';

const routerExpenses = express.Router();

routerExpenses.get('/expenses', getExpensesRappi);

export {routerExpenses}
