import express from 'express';
import connectDb from './database/index.js';

const app = express();


connectDb();

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the express-mongo API' });
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})