import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './scripts/seed.js';

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

async function startServer() {
  try {
    // Connect to database (with automatic MongoMemoryServer fallback for zero-config run)
    await connectDB();

    // Check if initial seed is needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No user records detected in database. Initializing seed data automatically...');
      await seedDatabase();
    } else {
      console.log(`Database already populated with ${userCount} users.`);
    }

    const server = app.listen(PORT, () => {
      console.log(`MentorHub AI Backend Server running smoothly on http://localhost:${PORT}`);
      console.log(`Health endpoint available at http://localhost:${PORT}/api/health`);
    });

    // Handle shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
      });
    });
  } catch (error) {
    console.error('Fatal error starting MentorHub AI server:', error);
    process.exit(1);
  }
}

startServer();
