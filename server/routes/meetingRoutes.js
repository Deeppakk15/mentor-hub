import express from 'express';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
} from '../controllers/meetingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMeetings);
router.post('/projects/:projectId/meetings', createMeeting);
router.post('/', createMeeting);
router.patch('/:id', updateMeeting);

export default router;
