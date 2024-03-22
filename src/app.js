import cors from 'cors';
import cookieParser from 'cookie-parser';
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

import { router } from './routes/user.route.js';
import { playlistRouter } from './routes/playlist.route.js';
import { videoRouter } from './routes/video.route.js';

app.use('/api/v1/users', router);

app.use("/api/v1/playlist", playlistRouter);

app.use("/api/v1/videos", videoRouter);



export { app }