const express = require('express');
const app = express();

const expensesRoutes = require('./routes/ExpensesRoutes');

const port = 3000;

app.use(express.json());
app.use('/api/expenses', expensesRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app; 