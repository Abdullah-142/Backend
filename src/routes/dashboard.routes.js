import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const dashoardRouter = Router();

dashoardRouter.use(verifyJWT);


dashoardRouter.route("/").get(getChannelStats);
dashoardRouter.route("/videos").get(getChannelVideos);


export { dashoardRouter };