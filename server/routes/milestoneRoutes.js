import express from 'express';
import {
  getMilestones,
  createMilestone,
  updateMilestone,
} from '../controllers/milestoneController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/projects/:projectId/milestones', getMilestones);
router.post('/projects/:projectId/milestones', createMilestone);
router.patch('/milestones/:id', updateMilestone);

export default router;
