const expensesService = require("../services/expensesService");

async function getExpenses(req, res) {
  try {
    const expenses = await expensesService.getExpenses();

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getExpenses,
};
