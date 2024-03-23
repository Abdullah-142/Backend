import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
} from "../controllers/tweet.controller.js";
const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route("/").get(getUserTweets);
tweetRouter.route("/create").post(createTweet);
tweetRouter.route("/update/:tweetId").patch(updateTweet);
tweetRouter.route("/delete/:tweetId").delete(deleteTweet);

export { tweetRouter };

