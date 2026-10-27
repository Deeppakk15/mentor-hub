import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Project-scoped task routes
router.get('/projects/:projectId/tasks', getTasks);
router.post('/projects/:projectId/tasks', createTask);

// Direct task ID routes
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
