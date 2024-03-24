import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}
  from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);

subscriptionRouter.route("/toggle/:channelId").post(toggleSubscription);

subscriptionRouter.route("/s/:channelId").get(getUserChannelSubscribers);

subscriptionRouter.route("/subscribed").get(getSubscribedChannels);

export { subscriptionRouter };