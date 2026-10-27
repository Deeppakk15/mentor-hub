import express from 'express';
import {
  getProjectEvaluations,
  createEvaluation,
  updateEvaluation,
} from '../controllers/evaluationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/projects/:projectId/evaluations', getProjectEvaluations);
router.post('/projects/:projectId/evaluations', createEvaluation);
router.patch('/evaluations/:id', updateEvaluation);

export default router;
