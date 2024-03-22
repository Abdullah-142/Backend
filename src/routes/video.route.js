import { Router } from "express";

import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  toggleVideoStatus,
  updateVideoDes
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const videoRouter = Router();

videoRouter.use(verifyJWT);


videoRouter.route("/").get(getAllVideos)

videoRouter.route("/publish-video").post(upload.fields([
  {
    name: "videoFile",
    maxCount: 1
  },
  {
    name: "thumbnail",
    maxCount: 1
  }
]), publishAVideo)

videoRouter.route("/:videoId").get(getVideoById)

videoRouter.route("/update-video/:videoId").post(updateVideoDes)

videoRouter.route("/:videoId").delete(deleteVideo)

videoRouter.route("/:videoId/toggle-status").patch(toggleVideoStatus);

export { videoRouter }