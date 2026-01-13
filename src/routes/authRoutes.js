import express from 'express';
import {authLogin, authRedirect} from '../controllers/authController.js';

const routerAuth = express.Router();

routerAuth.get('/auth/login/:id', authLogin);
routerAuth.get('/auth/redirect', authRedirect);

export {routerAuth };

