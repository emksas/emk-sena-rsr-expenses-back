const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer(); 
const expensesController = require('../controllers/ExpensesControllers');

router.get('/', upload.none(), expensesController.getExpenses);
router.get('/auth/login', expensesController.authLogin);
router.get('/auth/redirect', expensesController.authRedirect);
router.get('/messages', expensesController.getMessages);

router.post('/', upload.none(), expensesController.addExpense);
router.post('/messagesFromFolder', expensesController.getMessagesFromFolderPathHandler);

module.exports = router;