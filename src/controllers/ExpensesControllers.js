const expensesService = require("../services/expensesService");
const Expense = require("../models/Expense");
const { getFolderByName } = require("../services/grapMail");


async function getExpenses(req, res) {
  try {

    const folders = await getFolderByName();
    console.log("Fetched folders from Microsoft Graph:", folders);

    //const expenses = await expensesService.getExpenses();
    //res.status(200).json(expenses.map(expense => Expense.fromDatabaseRow(expense)));
    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
} 


async function addExpense(req, res) {
  try {
    const expense = req.body; 
    console.log("Received expense data:", expense);
    const expenseId = await expensesService.addExpense(expense);
    res.status(201).json({ id: expenseId });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getExpenses,
  addExpense
};
