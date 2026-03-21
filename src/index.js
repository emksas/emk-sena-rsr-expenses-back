console.log("MSAL_CACHE_ENC_KEY length:", process.env.MSAL_CACHE_ENC_KEY?.length);

import express from 'express';
import {routerAuth} from './routes/authRoutes.js';
import { routerExpenses } from './routes/ExpensesRoutes.js';
import { serve, setup } from 'swagger-ui-express';
import {swaggerSpec} from './config/swagger.js';
import session from 'express-session';

const app = express();
const port = 3000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

app.use('/api', routerAuth);
app.use('/api', routerExpenses);
app.use('/api-docs', serve, setup(swaggerSpec));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API');
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;