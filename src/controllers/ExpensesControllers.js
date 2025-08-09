const expensesService = require("../services/expensesService");
const Expense = require("../models/Expense");

async function getExpenses(req, res) {
  try {
    const expenses = await expensesService.getExpenses();
    res.status(200).json(expenses.map(expense => Expense.fromDatabaseRow(expense)));
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
