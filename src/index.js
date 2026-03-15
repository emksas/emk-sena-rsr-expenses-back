console.log("MSAL_CACHE_ENC_KEY length:", process.env.MSAL_CACHE_ENC_KEY?.length);

import express from 'express';
import {routerAuth} from './routes/authRoutes.js';
import { router } from './routes/ExpensesRoutes.js';
import { serve, setup } from 'swagger-ui-express';
import {swaggerSpec} from './config/swagger.js';

const app = express();
const port = 3000;

app.use('/api', routerAuth);
app.use('/api', router);
app.use('/api-docs', serve, setup(swaggerSpec));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API');
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;