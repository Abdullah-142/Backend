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


export default app;