import express from 'express';
import connectDb from './database/index.js';

const app = express();


connectDb().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
})
  .catch((error) => {
    console.log('Error connecting to the database', error);
    process.exit(1);
  });
