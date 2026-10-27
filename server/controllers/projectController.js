import Project from '../models/Project.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Document from '../models/Document.js';
import { createNotification } from '../services/notifications/notificationService.js';
import { logAudit } from '../services/audit/auditService.js';

// Create a project proposal draft
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      abstract,
      problemStatement,
      objectives,
      domain,
      technologies,
      expectedOutcomes,
      references,
    } = req.body;

    if (!title || !abstract || !domain) {
      return res.status(400).json({ message: 'Project title, abstract, and domain are required.' });
    }

    // Find the student's team
    const team = await Team.findOne({
      $or: [
        { leader: req.user._id },
        { 'members.user': req.user._id },
      ],
    });

    if (!team) {
      return res.status(400).json({
        message: 'You must form or join a student team before creating a project proposal.',
      });
    }

    // Check if team already has an active project
    const existingProject = await Project.findOne({
      team: team._id,
      status: { $in: ['draft', 'submitted', 'under_review', 'approved'] },
    });

    if (existingProject) {
      return res.status(400).json({
        message: 'Your team already has an active or submitted project proposal.',
        projectId: existingProject._id,
      });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : (technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : []);

    const project = await Project.create({
      title: title.trim(),
      abstract: abstract.trim(),
      problemStatement: problemStatement ? problemStatement.trim() : '',
      objectives: objectives ? objectives.trim() : '',
      domain: domain.trim(),
      technologies: techArray,
      expectedOutcomes: expectedOutcomes ? expectedOutcomes.trim() : '',
      references: references ? references.trim() : '',
      team: team._id,
      status: 'draft',
      submissionVersion: 1,
      progress: 0,
      approvalHistory: [{
        status: 'draft',
        updatedBy: req.user._id,
        feedback: 'Initial project proposal draft initiated by team.',
        updatedAt: new Date(),
      }],
    });

    // Update team reference
    team.project = project._id;
    await team.save();

    await logAudit({
      actor: req.user,
      action: 'PROJECT_PROPOSAL_CREATED',
      resourceType: 'Project',
      resourceId: project._id,
      metadata: { title: project.title, domain: project.domain },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Project draft created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Get projects based on user role and query filters
export const getProjects = async (req, res, next) => {
  try {
    const { status, domain, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') query.status = status;
    if (domain && domain !== 'All') query.domain = domain;

    // Role-based restrictions
    if (req.user.role === 'student') {
      const myTeam = await Team.findOne({
        $or: [{ leader: req.user._id }, { 'members.user': req.user._id }],
      });
      if (!myTeam) {
        return res.json({ projects: [], pagination: { total: 0, page: 1, pages: 1 } });
      }
      query.team = myTeam._id;
    } else if (req.user.role === 'faculty') {
      // Faculty views their mentored projects, or proposals awaiting review
      query.$or = [
        { mentor: req.user._id },
        { status: { $in: ['submitted', 'under_review'] } },
      ];
    }
    // Admin sees all without extra role filter

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('team', 'name leader members')
      .populate('mentor', 'name email department')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single project details with populated tasks, milestones, documents
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'team',
        populate: [
          { path: 'leader', select: 'name email department studentId profileImage' },
          { path: 'members.user', select: 'name email department studentId profileImage' },
        ],
      })
      .populate('mentor', 'name email department bio expertise profileImage')
      .populate('approvalHistory.updatedBy', 'name role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Role-based access validation
    if (req.user.role === 'student') {
      const isTeamMember = project.team?.members?.some(
        m => m.user._id.toString() === req.user._id.toString()
      ) || project.team?.leader?._id.toString() === req.user._id.toString();

      if (!isTeamMember) {
        return res.status(403).json({ message: 'Access denied: You are not authorized to view this team\'s private project.' });
      }
    }

    // Fetch related items
    const tasks = await Task.find({ project: project._id }).populate('assignee', 'name email').sort({ dueDate: 1 });
    const milestones = await Milestone.find({ project: project._id }).sort({ targetDate: 1 });
    const documents = await Document.find({ project: project._id }).populate('uploadedBy', 'name role').sort({ createdAt: -1 });

    res.json({
      project,
      tasks,
      milestones,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// Update project draft or revision
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Permission check
    const isTeamMember = project.team?.members?.some(
      m => m.user.toString() === req.user._id.toString()
    ) || project.team?.leader.toString() === req.user._id.toString();

    if (!isTeamMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team members or administrators can edit this project.' });
    }

    // Enforce workflow: allow editing only in draft or changes_requested states
    if (!['draft', 'changes_requested'].includes(project.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        message: `Project cannot be edited directly while in '${project.status}' status. Revisions must follow the review workflow.`,
      });
    }

    const {
      title,
      abstract,
      problemStatement,
      objectives,
      domain,
      technologies,
      expectedOutcomes,
      references,
    } = req.body;

    if (title) project.title = title.trim();
    if (abstract) project.abstract = abstract.trim();
    if (problemStatement !== undefined) project.problemStatement = problemStatement.trim();
    if (objectives !== undefined) project.objectives = objectives.trim();
    if (domain) project.domain = domain.trim();
    if (technologies) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : technologies.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (expectedOutcomes !== undefined) project.expectedOutcomes = expectedOutcomes.trim();
    if (references !== undefined) project.references = references.trim();

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Submit proposal for faculty review
export const submitProposal = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check permissions
    const isTeamMember = project.team?.members?.some(
      m => m.user.toString() === req.user._id.toString()
    ) || project.team?.leader.toString() === req.user._id.toString();

    if (!isTeamMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team members can submit the proposal.' });
    }

    if (project.status === 'approved') {
      return res.status(400).json({ message: 'Project proposal is already approved.' });
    }

    // If resubmitting from changes_requested
    if (project.status === 'changes_requested') {
      project.submissionVersion += 1;
    }

    project.status = project.mentor ? 'under_review' : 'submitted';
    project.approvalHistory.push({
      status: project.status,
      updatedBy: req.user._id,
      feedback: req.body.notes || `Proposal version ${project.submissionVersion} submitted for faculty review.`,
      updatedAt: new Date(),
    });

    await project.save();

    // If mentor is already assigned, notify them
    if (project.mentor) {
      await createNotification({
        recipient: project.mentor,
        type: 'proposal_submitted',
        title: 'Project Proposal Submitted',
        message: `Team "${project.team.name}" submitted proposal "${project.title}" for review.`,
        resourceType: 'Project',
        resourceId: project._id,
        link: `/faculty/projects/${project._id}`,
      });
    }

    await logAudit({
      actor: req.user,
      action: 'PROPOSAL_SUBMITTED',
      resourceType: 'Project',
      resourceId: project._id,
      metadata: { version: project.submissionVersion, status: project.status },
      ip: req.ip,
    });

    res.json({
      message: 'Project proposal submitted for review successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Update project workflow status (Faculty or Admin)
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const project = await Project.findById(req.params.id).populate('team');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Faculty can review if they are mentor, or admin can review
    const isMentor = project.mentor && project.mentor.toString() === req.user._id.toString();
    if (!isMentor && req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Unauthorized to change project status.' });
    }

    const validStatuses = ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    project.status = status;
    if (status === 'approved' && project.progress === 0) {
      project.progress = 10; // Initial kickoff progress
    }
    if (status === 'completed') {
      project.progress = 100;
    }

    project.approvalHistory.push({
      status,
      updatedBy: req.user._id,
      feedback: feedback || `Status transitioned to ${status} by ${req.user.name}`,
      updatedAt: new Date(),
    });

    await project.save();

    // Notify student team members
    const team = await Team.findById(project.team._id);
    if (team) {
      const recipientIds = [team.leader, ...team.members.map(m => m.user)];
      for (const recipientId of recipientIds) {
        await createNotification({
          recipient: recipientId,
          type: `project_${status}`,
          title: `Project Status: ${status.replace('_', ' ').toUpperCase()}`,
          message: feedback ? `Status changed to ${status}: "${feedback}"` : `Your project "${project.title}" has been moved to ${status}.`,
          resourceType: 'Project',
          resourceId: project._id,
          link: `/student/projects/${project._id}`,
        });
      }
    }

    await logAudit({
      actor: req.user,
      action: `PROJECT_STATUS_${status.toUpperCase()}`,
      resourceType: 'Project',
      resourceId: project._id,
      metadata: { newStatus: status, feedback },
      ip: req.ip,
    });

    res.json({
      message: `Project status successfully updated to ${status}.`,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Final project submission (when completing capstone)
export const finalSubmission = async (req, res, next) => {
  try {
    const { finalReportUrl, notes } = req.body;
    const project = await Project.findById(req.params.id).populate('team');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved active projects can submit for final evaluation.' });
    }

    if (finalReportUrl) project.finalReportUrl = finalReportUrl;
    project.progress = 95; // Ready for evaluation
    project.approvalHistory.push({
      status: 'final_submitted',
      updatedBy: req.user._id,
      feedback: notes || 'Final project deliverables submitted for faculty evaluation.',
      updatedAt: new Date(),
    });

    await project.save();

    if (project.mentor) {
      await createNotification({
        recipient: project.mentor,
        type: 'final_submission',
        title: 'Final Project Submitted for Evaluation',
        message: `Team "${project.team.name}" submitted their final project deliverables for "${project.title}".`,
        resourceType: 'Project',
        resourceId: project._id,
        link: `/faculty/evaluations`,
      });
    }

    res.json({
      message: 'Final project deliverables submitted for evaluation successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};
