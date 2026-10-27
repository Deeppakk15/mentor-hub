import express from 'express';
import {
  createTeam,
  getMyTeam,
  getTeamById,
  updateTeam,
  inviteMember,
  getMyInvitations,
  respondInvitation,
  removeMember,
} from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createTeam);
router.get('/me', getMyTeam);
router.get('/invitations/my', getMyInvitations);
router.get('/:id', getTeamById);
router.patch('/:id', updateTeam);
router.post('/:id/invitations', inviteMember);
router.post('/:id/invitations/respond', respondInvitation);
router.post('/:id/remove-member', removeMember);

export default router;
