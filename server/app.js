import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import mentorRequestRoutes from './routes/mentorRequestRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static file uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'MentorHub AI Platform API',
    timestamp: new Date().toISOString(),
  });
});

// Reseed endpoint for development and testing
app.post('/api/dev/reseed', async (req, res, next) => {
  try {
    const { seedDatabase } = await import('./scripts/seed.js');
    await seedDatabase();
    res.json({ message: 'Database reseeded successfully with requested student & faculty rosters!' });
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/mentor-requests', mentorRequestRoutes);
app.use('/api', taskRoutes);
app.use('/api', milestoneRoutes);
app.use('/api', documentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api', evaluationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint '${req.originalUrl}' not found.` });
});

// Centralized error handler
app.use(errorHandler);

export default app;
