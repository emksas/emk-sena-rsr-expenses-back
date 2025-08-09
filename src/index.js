const express = require('express');
const app = express();
const expensesRoutes = require('./routes/expensesRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const accountRoutes = require('./routes/AccountRoutes');
const port = 3000;

app.use(express.json());
app.use('/api/expenses', expensesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app; 