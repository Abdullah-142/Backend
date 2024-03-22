import { Router } from 'express';
import {
  registerHandler,
  logoutHandler,
  loginHandler,
  refreshTokenHandler,
  getCurrentUser,
  updatepasswordHanlder,
  updateUserProfile,
  updateAvatar,
  updateCoverImage,
  getUserProfile,
  getUserWatchHistory
} from '../controllers/user.controller.js';
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
router.route('/get-current-user').get(verifyJWT, getCurrentUser);
router.route('/update-password').post(verifyJWT, updatepasswordHanlder);
router.route('/update-profile').patch(verifyJWT, updateUserProfile);
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar);
router.route('/update-background-image').patch(verifyJWT, upload.single('backgroundImage'), updateCoverImage);
router.route('/u/:username').get(verifyJWT, getUserProfile);
router.route('/u/:id/watch-history').get(verifyJWT, getUserWatchHistory);


// user model is done


export { router }