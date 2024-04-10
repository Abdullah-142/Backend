import { Router } from 'express';
import {
  getCurrentUser,
  getUserProfile,
  getUserWatchHistory,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  updateAvatar,
  updateCoverImage,
  updatepasswordHanlder,
  updateUserProfile
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
const userRouter = Router();


userRouter.route('/register').post(upload.fields([
  {
    name: 'avatar',
    maxCount: 1,
  },
  {
    name: 'backgroundImage',
    maxCount: 1
  }
]), registerHandler);

userRouter.route('/login').post(loginHandler);
// secured routes

userRouter.route('/logout').post(verifyJWT, logoutHandler);
userRouter.route('/refresh-token').post(refreshTokenHandler);
userRouter.route('/get-current-user').get(verifyJWT, getCurrentUser);
userRouter.route('/update-password').post(verifyJWT, updatepasswordHanlder);
userRouter.route('/update-profile').patch(verifyJWT, updateUserProfile);
userRouter.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar);
userRouter.route('/update-background-image').patch(verifyJWT, upload.single('backgroundImage'), updateCoverImage);
userRouter.route('/u/:username').get(verifyJWT, getUserProfile);
userRouter.route('/u/:id/watch-history').get(verifyJWT, getUserWatchHistory);


// user model is done


export { userRouter };

