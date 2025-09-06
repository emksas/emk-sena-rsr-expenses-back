const accountService = require('../services/AccountService');

async function getAccounts(req, res) {
    
    const numbers = [
        1, 
        2, 3, 4]; 
    const numbersTwo = new Array(4); 
    const numbersThree = null; 

    numbersThree.push(1)
    
    
    
    try {




        const accounts = await accountService.getAccounts();
        res.status(200).json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addAccount(req, res) {
    const account = req.body;
    try {
        const accountId = await accountService.addAccount(account);
        res.status(201).json({ id: accountId });
    } catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateAccount(req, res) {
    const account = req.body;
    try {
        const affectedRows = await accountService.updateAccount(account);
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Account updated successfully' });
        }
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteAccount(req, res) {   
    const accountId = req.params.id;
    try {
        const affectedRows = await accountService.deleteAccount({ id: accountId });
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Account deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getAccounts,
    addAccount,
    updateAccount,
    deleteAccount
};