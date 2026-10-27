import express from 'express';
import {
  uploadDocument,
  getProjectDocuments,
  downloadDocument,
  reviewDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../services/storage/storageService.js';

const router = express.Router();

// Download route (public or token-accessible)
router.get('/download/:filename', downloadDocument);

// Authenticated document routes
router.use(authenticate);

router.post('/projects/:projectId/documents', upload.single('file'), uploadDocument);
router.get('/projects/:projectId/documents', getProjectDocuments);
router.patch('/documents/:id/review', reviewDocument);
router.delete('/documents/:id', deleteDocument);

export default router;
