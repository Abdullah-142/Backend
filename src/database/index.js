import mongooes from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDb = async () => {
  try {
    await mongooes.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`Database Connected`);
  } catch (error) {
    console.log('Database connection failed', error);
    process.exit(1);
  }
}

export default connectDb;
