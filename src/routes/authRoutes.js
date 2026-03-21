import express from 'express';
import {authLogin, authRedirect, user_information} from '../controllers/authController.js';
import session from 'express-session';

const routerAuth = express.Router();

/**
 * @swagger
 * /auth/login/{id}:
 *   get:
 *     summary: Login to an microsoft account
 *     description: Get token to access to microsoft account
 */
routerAuth.get('/auth/login{/:id}', authLogin);

/**
 * @swagger
 * /auth/redirect:
 *   get:
 *     summary: Redirect to login microsoft account
 *     description: Get token to access to microsoft account
 */
routerAuth.get('/auth/redirect', authRedirect);



routerAuth.get('/auth/user-information', user_information);

export {routerAuth };

