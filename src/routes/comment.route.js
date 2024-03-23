import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}
  from "../controllers/comment.controller.js";
const commentRouter = Router();


commentRouter.use(verifyJWT);

commentRouter.route("/:videoId").get(getVideoComments);

commentRouter.route("/add/:videoId").post(addComment);

commentRouter.route("/delete/:commentId").delete(deleteComment);

commentRouter.route("/update/:commentId").patch(updateComment);

export { commentRouter };