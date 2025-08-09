const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesControllers');

router.get('/', expensesController.getExpenses);

module.exports = router;