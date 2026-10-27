import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  getSessions,
  createSession,
  updateSession,
  getDomains,
  createDomain,
  getFacultyWorkload,
  getAuditLogs,
  exportReportCsv,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Publicly readable within institution, but editable only by admin
router.get('/departments', getDepartments);
router.post('/departments', authorizeRoles('admin'), createDepartment);
router.patch('/departments/:id', authorizeRoles('admin'), updateDepartment);

router.get('/sessions', getSessions);
router.post('/sessions', authorizeRoles('admin'), createSession);
router.patch('/sessions/:id', authorizeRoles('admin'), updateSession);

router.get('/domains', getDomains);
router.post('/domains', authorizeRoles('admin'), createDomain);

// Admin-restricted analytics & logs
router.get('/workload', authorizeRoles('admin'), getFacultyWorkload);
router.get('/audit-logs', authorizeRoles('admin'), getAuditLogs);
router.get('/export-csv', authorizeRoles('admin'), exportReportCsv);

export default router;
