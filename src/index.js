import express from 'express';
import {router} from './routes/ExpensesRoutes.js';

const app = express();
const port = 3000;
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API');
});
app.use('/api/expenses', router);
app.use('/api/auth', routerAuth);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

  export default app;