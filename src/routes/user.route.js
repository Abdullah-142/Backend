import { Router } from 'express';
import { registerHandler, logoutHandler, loginHandler, refreshTokenHandler } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
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

router.route('/login').post(loginHandler);

// secured routes

router.route('/logout').post(verifyJWT, logoutHandler);
router.route('/refresh-token').post(refreshTokenHandler);


export { router }