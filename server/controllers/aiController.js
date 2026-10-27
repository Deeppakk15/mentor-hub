import {
  generateProjectIdeas,
  reviewProposal,
  recommendTechnologies,
  generateRoadmap,
  summarizeReport,
  generateVivaQuestions,
  draftFeedback,
  chatWithAssistant,
} from '../services/ai/geminiService.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';

export const handleProjectIdeas = async (req, res, next) => {
  try {
    const { domain, interests, difficulty } = req.body;
    const result = await generateProjectIdeas({ domain, interests, difficulty });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleReviewProposal = async (req, res, next) => {
  try {
    const { title, abstract, problemStatement, objectives, domain, technologies } = req.body;
    if (!title || !abstract) {
      return res.status(400).json({ message: 'Project title and abstract are required for AI proposal review.' });
    }
    const result = await reviewProposal({ title, abstract, problemStatement, objectives, domain, technologies });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleRecommendTechnologies = async (req, res, next) => {
  try {
    const { projectType, requirements, constraints, teamSkillLevel } = req.body;
    const result = await recommendTechnologies({ projectType, requirements, constraints, teamSkillLevel });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleGenerateRoadmap = async (req, res, next) => {
  try {
    const { title, description, technologies, weeks } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Project title is required to generate a development roadmap.' });
    }
    const result = await generateRoadmap({ title, description, technologies, weeks });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleSummarizeReport = async (req, res, next) => {
  try {
    const { title, reportText } = req.body;
    if (!title && !reportText) {
      return res.status(400).json({ message: 'Report title or text content is required.' });
    }
    const result = await summarizeReport({ title, reportText });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleGenerateVivaQuestions = async (req, res, next) => {
  try {
    const { projectTitle, domain, technologies, abstract } = req.body;
    const result = await generateVivaQuestions({ projectTitle, domain, technologies, abstract });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleSummarizeProgress = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    let projectTitle = 'Academic Project';
    let stats = 'Active project progress review';

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        projectTitle = project.title;
        const totalTasks = await Task.countDocuments({ project: projectId });
        const completedTasks = await Task.countDocuments({ project: projectId, status: 'completed' });
        const totalMilestones = await Milestone.countDocuments({ project: projectId });
        const approvedMilestones = await Milestone.countDocuments({ project: projectId, status: 'approved' });
        stats = `Tasks: ${completedTasks}/${totalTasks} completed. Milestones: ${approvedMilestones}/${totalMilestones} approved. Overall Progress: ${project.progress}%.`;
      }
    }

    const summaryText = `### Academic Progress Summary: ${projectTitle}
- **Quantitative Metrics:** ${stats}
- **Trajectory:** On schedule for upcoming semester deliverables.
- **Recommendations:** Focus next sprint on addressing pending code reviews and updating API documentation.`;

    res.json({
      success: true,
      text: summaryText,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDraftFeedback = async (req, res, next) => {
  try {
    const { projectTitle, studentTeam, milestoneTitle, performanceNotes, approvalDecision } = req.body;
    const result = await draftFeedback({ projectTitle, studentTeam, milestoneTitle, performanceNotes, approvalDecision });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const handleChat = async (req, res, next) => {
  try {
    const { message, history, projectContext } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message prompt cannot be empty.' });
    }
    const result = await chatWithAssistant({
      message: message.trim(),
      history,
      projectContext,
      role: req.user.role,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
