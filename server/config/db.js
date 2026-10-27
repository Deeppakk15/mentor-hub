import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to specified MongoDB URI...');
      await mongoose.connect(uri);
      console.log('MongoDB connected successfully via URI.');
      return;
    } catch (err) {
      console.warn('Failed to connect to specified MongoDB URI:', err.message);
      console.log('Falling back to local MongoMemoryServer for development...');
    }
  }

  try {
    console.log('Starting in-memory MongoDB server instance (mongodb-memory-server)...');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Connected to in-memory MongoDB at: ${memoryUri}`);
  } catch (error) {
    console.error('Critical: Could not connect to any MongoDB instance:', error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
