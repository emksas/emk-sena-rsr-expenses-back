import express from 'express';
import multer from 'multer';
import {getExpenses} from '../controllers/ExpensesControllers.js';

const routerExpenses = express.Router();

routerExpenses.get('/expenses', getExpenses);

export {routerExpenses}
