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

import { playlistRouter } from './routes/playlist.route.js';
import { router } from './routes/user.route.js';
import { videoRouter } from './routes/video.route.js';
import { tweetRouter } from './routes/tweet.route.js';
import { commentRouter } from './routes/comment.route.js';
import { likeRouter } from './routes/like.route.js';

app.use('/api/v1/users', router);

app.use("/api/v1/playlist", playlistRouter);

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/comment", commentRouter);

app.use("/api/v1/like", likeRouter);



export { app };
