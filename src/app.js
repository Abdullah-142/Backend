import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({
  limit: '15kb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '15kb'
}));

app.use(express.static('public'));
app.use(cookieParser());

import { playlistRouter } from './routes/playlist.routes.js';
import { userRouter } from './routes/user.routes.js';
import { videoRouter } from './routes/video.routes.js';
import { tweetRouter } from './routes/tweet.routes.js';
import { commentRouter } from './routes/comment.routes.js';
import { likeRouter } from './routes/like.routes.js';
import { dashoardRouter } from './routes/dashboard.routes.js';
import { subscriptionRouter } from './routes/subscription.routes.js';
import { healthcheck } from './controllers/healthcheck.controller.js';


app.use('/api/v1/users', userRouter);

app.use("/api/v1/playlist", playlistRouter);

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/comment", commentRouter);

app.use("/api/v1/like", likeRouter);

app.use("/api/v1/dashboard", dashoardRouter);

app.use("/api/v1/subscription", subscriptionRouter);

app.get('/api/v1/healthcheck', healthcheck);



export { app };
