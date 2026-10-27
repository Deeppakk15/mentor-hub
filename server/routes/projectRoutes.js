import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  submitProposal,
  updateProjectStatus,
  finalSubmission,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.patch('/:id', updateProject);
router.post('/:id/submit', submitProposal);
router.post('/:id/resubmit', submitProposal);
router.patch('/:id/status', updateProjectStatus);
router.post('/:id/final-submission', finalSubmission);

export default router;
