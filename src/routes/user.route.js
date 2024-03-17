import { Router } from 'express';
import { registerHandler } from '../controllers/user.controller.js';
const router = Router();


router.route('/register').post(registerHandler);


export { router }