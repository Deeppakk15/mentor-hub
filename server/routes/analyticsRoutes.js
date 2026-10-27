import express from 'express';
import {
  getStudentAnalytics,
  getFacultyAnalytics,
  getAdminAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/student', getStudentAnalytics);
router.get('/faculty', getFacultyAnalytics);
router.get('/admin', authorizeRoles('admin'), getAdminAnalytics);

export default router;
