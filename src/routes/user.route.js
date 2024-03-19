import { Router } from 'express';
import { registerHandler, logoutHandler } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
const router = Router();


router.route('/register').post(upload.fields([
  {
    name: 'avatar',
    maxCount: 1,
  },
  {
    name: 'backgroundImage',
    maxCount: 1
  }
]), registerHandler);

// secured routes

router.route('/logout').post(verifyJwt, logoutHandler);


export { router }