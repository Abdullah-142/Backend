import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}
  from "../controllers/like.controller.js";
const likeRouter = Router();


likeRouter.use(verifyJWT);

likeRouter.route("/toggle/v/:videoId").post(toggleVideoLike);

likeRouter.route("/toggle/c/:commentId").post(toggleCommentLike);

likeRouter.route("/delete/:commentId").delete(toggleVideoLike);

likeRouter.route("/update/:commentId").patch(getLikedVideos);

export { likeRouter };