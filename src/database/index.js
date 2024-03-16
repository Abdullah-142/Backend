import mongooes from 'mongoose';

//work on process.env.MONGO_URI later

const connectDb = async () => {
  try {
    await mongooes.connect(process.env.MONGO_URI / 'tubevideo');
    console.log('Database connected');
  } catch (error) {
    console.log('Database connection failed', error);
  }
}

export default connectDb;