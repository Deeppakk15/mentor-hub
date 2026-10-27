import express from 'express';
import {
  createMentorRequest,
  getMentorRequests,
  handleRequestDecision,
} from '../controllers/mentorRequestController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createMentorRequest);
router.get('/', getMentorRequests);
router.patch('/:id/decision', handleRequestDecision);

export default router;
