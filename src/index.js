import connectDb from './database/index.js';

import { app } from './app.js';


connectDb().then(() => {
  app.listen(4000, () => {
    console.log('Server is running on port 4000');
  });
})
  .catch((error) => {
    console.log('Error connecting to the database', error);
    process.exit(1);
  });

