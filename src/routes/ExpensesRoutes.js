import express from 'express';
import multer from 'multer';
import {getExpenses, authLogin, authRedirect, getMessagesFromFolderPathHandler} from '../controllers/ExpensesControllers.js';

const routerExpenses = express.Router();
const router = express.Router();
const upload = multer();

routerExpenses.get('/expenses/', upload.none(), getExpenses);
routerExpenses.post('/messagesFromFolder', getMessagesFromFolderPathHandler);

router.use('/expenses', routerExpenses);

export {router};
