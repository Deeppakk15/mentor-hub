import express from 'express';
import {
  getProfile,
  updateProfile,
  getFacultyList,
  getFacultyById,
  getAllUsers,
  createUserByAdmin,
  updateUserStatus,
} from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// General Authenticated User Routes
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);

// Faculty directory (accessible by students, faculty, admin)
router.get('/faculty', authenticate, getFacultyList);
router.get('/faculty/:id', authenticate, getFacultyById);

// Admin-only user management
router.get('/admin/all', authenticate, authorizeRoles('admin'), getAllUsers);
router.post('/admin/create', authenticate, authorizeRoles('admin'), createUserByAdmin);
router.patch('/admin/:id/status', authenticate, authorizeRoles('admin'), updateUserStatus);

export default router;
