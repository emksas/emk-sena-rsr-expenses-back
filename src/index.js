import express from 'express';
import {routerAuth} from './routes/authRoutes.js';

const app = express();
const port = 3000;

app.use('/api', routerAuth);
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API');
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

  export default app;