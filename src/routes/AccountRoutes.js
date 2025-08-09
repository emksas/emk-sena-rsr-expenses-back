const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');

router.get('/', accountController.getAccount);
router.post('/', accountController.addAccount);
router.put('/', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;