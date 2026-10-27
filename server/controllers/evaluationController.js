import Evaluation from '../models/Evaluation.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import { createNotification } from '../services/notifications/notificationService.js';
import { logAudit } from '../services/audit/auditService.js';

// Default standard rubrics
export const DEFAULT_CRITERIA = [
  { name: 'Problem Understanding & Scope', maxScore: 15, score: 0, comment: '' },
  { name: 'Technical Implementation & Architecture', maxScore: 20, score: 0, comment: '' },
  { name: 'Innovation & Research Value', maxScore: 15, score: 0, comment: '' },
  { name: 'Code Quality & Engineering Standards', maxScore: 15, score: 0, comment: '' },
  { name: 'Documentation & Technical Reporting', maxScore: 15, score: 0, comment: '' },
  { name: 'Viva Voce & Final Presentation', maxScore: 10, score: 0, comment: '' },
  { name: 'Team Collaboration & Agile Execution', maxScore: 10, score: 0, comment: '' },
];

// Get evaluations for a project
export const getProjectEvaluations = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const evaluations = await Evaluation.find({ project: projectId })
      .populate('evaluator', 'name email department')
      .sort({ createdAt: -1 });

    res.json({
      evaluations,
      defaultCriteria: DEFAULT_CRITERIA,
    });
  } catch (error) {
    next(error);
  }
};

// Create or submit an evaluation (Faculty or Admin)
export const createEvaluation = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { criteria, feedback, status } = req.body;

    const project = await Project.findById(projectId).populate('team');
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Role check: Only assigned mentor or faculty or admin can evaluate
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only faculty members or administrators can submit project evaluations.' });
    }

    const evaluatedCriteria = (criteria && criteria.length > 0) ? criteria : DEFAULT_CRITERIA;
    const totalScore = evaluatedCriteria.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

    const isSubmission = status === 'submitted';

    const evaluation = await Evaluation.create({
      project: projectId,
      evaluator: req.user._id,
      criteria: evaluatedCriteria,
      totalScore,
      maxTotalScore: 100,
      feedback: feedback ? feedback.trim() : '',
      status: isSubmission ? 'submitted' : 'draft',
      submittedAt: isSubmission ? new Date() : null,
    });

    if (isSubmission) {
      // Update project final score and status
      project.finalScore = totalScore;
      project.status = 'completed';
      project.progress = 100;
      project.approvalHistory.push({
        status: 'completed',
        updatedBy: req.user._id,
        feedback: `Project evaluated with final score of ${totalScore}/100. Evaluator: ${req.user.name}.`,
        updatedAt: new Date(),
      });
      await project.save();

      // Notify students
      const team = await Team.findById(project.team._id);
      if (team) {
        const studentIds = [team.leader, ...team.members.map(m => m.user)];
        for (const studentId of studentIds) {
          await createNotification({
            recipient: studentId,
            type: 'evaluation_published',
            title: 'Project Evaluation Published',
            message: `Final evaluation for "${project.title}" has been published: ${totalScore}/100.`,
            resourceType: 'Evaluation',
            resourceId: evaluation._id,
            link: `/student/projects/${project._id}`,
          });
        }
      }

      await logAudit({
        actor: req.user,
        action: 'PROJECT_EVALUATION_SUBMITTED',
        resourceType: 'Evaluation',
        resourceId: evaluation._id,
        metadata: { project: project.title, totalScore },
        ip: req.ip,
      });
    }

    res.status(201).json({
      message: isSubmission ? 'Evaluation finalized and submitted.' : 'Draft evaluation saved.',
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// Update evaluation
export const updateEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { criteria, feedback, status } = req.body;

    const evaluation = await Evaluation.findById(id).populate('project');
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found.' });
    }

    // Protect finalized evaluation from unauthorized edits
    if (evaluation.status === 'submitted' && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Final evaluations cannot be modified without administrator authorization.',
      });
    }

    if (criteria) {
      evaluation.criteria = criteria;
      evaluation.totalScore = criteria.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    }

    if (feedback !== undefined) evaluation.feedback = feedback.trim();

    if (status === 'submitted') {
      evaluation.status = 'submitted';
      evaluation.submittedAt = new Date();

      const project = await Project.findById(evaluation.project._id);
      if (project) {
        project.finalScore = evaluation.totalScore;
        project.status = 'completed';
        project.progress = 100;
        await project.save();
      }
    }

    await evaluation.save();

    res.json({
      message: 'Evaluation updated successfully',
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};
