import express from 'express';
import {
  handleProjectIdeas,
  handleReviewProposal,
  handleRecommendTechnologies,
  handleGenerateRoadmap,
  handleSummarizeReport,
  handleGenerateVivaQuestions,
  handleSummarizeProgress,
  handleDraftFeedback,
  handleChat,
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/project-ideas', handleProjectIdeas);
router.post('/review-proposal', handleReviewProposal);
router.post('/recommend-technologies', handleRecommendTechnologies);
router.post('/generate-roadmap', handleGenerateRoadmap);
router.post('/summarize-report', handleSummarizeReport);
router.post('/generate-viva-questions', handleGenerateVivaQuestions);
router.post('/summarize-progress', handleSummarizeProgress);
router.post('/draft-feedback', handleDraftFeedback);
router.post('/chat', handleChat);

export default router;
