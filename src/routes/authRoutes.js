import express from 'exporess';
import {authLogin, authRedirect} from '../controllers/AuthControllers.js';

const routerAuth = express.Router();

routerAuth.get('/auth/login', authLogin);
routerAuth.get('/auth/redirect', authRedirect);

export {routerAuth};



