import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import { createNotification } from '../services/notifications/notificationService.js';

// Get milestones for project
export const getMilestones = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const milestones = await Milestone.find({ project: projectId })
      .populate('approvedBy', 'name role')
      .sort({ targetDate: 1 });

    res.json({ milestones });
  } catch (error) {
    next(error);
  }
};

// Create a milestone
export const createMilestone = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, targetDate } = req.body;

    if (!title || !targetDate) {
      return res.status(400).json({ message: 'Milestone title and target date are required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const milestone = await Milestone.create({
      project: projectId,
      title: title.trim(),
      description: description ? description.trim() : '',
      targetDate: new Date(targetDate),
      status: 'pending',
    });

    res.status(201).json({
      message: 'Milestone created successfully',
      milestone,
    });
  } catch (error) {
    next(error);
  }
};

// Update milestone (student submits evidence or faculty reviews/approves)
export const updateMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status, evidence, facultyFeedback } = req.body;

    const milestone = await Milestone.findById(id).populate('project');
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    if (title) milestone.title = title.trim();
    if (description !== undefined) milestone.description = description.trim();
    if (targetDate) milestone.targetDate = new Date(targetDate);

    // Student submits evidence
    if (evidence && Array.isArray(evidence)) {
      milestone.evidenceDocuments = evidence;
      milestone.status = 'submitted';
    } else if (evidence && evidence.title && evidence.url) {
      milestone.evidenceDocuments.push(evidence);
      milestone.status = 'submitted';
    }

    // Faculty review
    if (status) {
      milestone.status = status;
      if (status === 'approved') {
        milestone.approvedBy = req.user._id;
        milestone.approvedAt = new Date();
      }
    }

    if (facultyFeedback !== undefined) {
      milestone.facultyFeedback = facultyFeedback.trim();
    }

    await milestone.save();

    // Notify project team if faculty reviewed
    if (status && (status === 'approved' || status === 'changes_requested')) {
      const project = await Project.findById(milestone.project._id).populate('team');
      if (project && project.team) {
        const team = await Team.findById(project.team._id);
        if (team) {
          const recipientIds = [team.leader, ...team.members.map(m => m.user)];
          for (const recipientId of recipientIds) {
            await createNotification({
              recipient: recipientId,
              type: `milestone_${status}`,
              title: `Milestone: ${status === 'approved' ? 'Approved' : 'Changes Requested'}`,
              message: `Milestone "${milestone.title}" was evaluated: ${milestone.facultyFeedback || status}`,
              resourceType: 'Milestone',
              resourceId: milestone._id,
              link: `/student/milestones`,
            });
          }
        }
      }
    }

    // Recalculate project progress
    const totalMilestones = await Milestone.countDocuments({ project: milestone.project._id });
    const approvedMilestones = await Milestone.countDocuments({ project: milestone.project._id, status: 'approved' });
    if (totalMilestones > 0) {
      const milestoneRatio = approvedMilestones / totalMilestones;
      const project = await Project.findById(milestone.project._id);
      if (project) {
        project.progress = Math.min(95, Math.round(20 + milestoneRatio * 70));
        await project.save();
      }
    }

    const populatedMilestone = await Milestone.findById(milestone._id).populate('approvedBy', 'name role');

    res.json({
      message: 'Milestone updated successfully',
      milestone: populatedMilestone,
    });
  } catch (error) {
    next(error);
  }
};
