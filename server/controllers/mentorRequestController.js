import MentorRequest from '../models/MentorRequest.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { createNotification } from '../services/notifications/notificationService.js';
import { logAudit } from '../services/audit/auditService.js';

// Student submits a mentor request to a faculty member
export const createMentorRequest = async (req, res, next) => {
  try {
    const { projectId, facultyId, studentMessage } = req.body;

    if (!projectId || !facultyId) {
      return res.status(400).json({ message: 'Project ID and target faculty ID are required.' });
    }

    const project = await Project.findById(projectId).populate('team');
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Verify requesting user is part of the project's team
    const team = await Team.findById(project.team._id);
    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString()) ||
      team.leader.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can request mentorship for this project.' });
    }

    // Verify faculty exists
    const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
    if (!faculty) {
      return res.status(404).json({ message: 'Selected faculty mentor was not found.' });
    }

    // Check if project already has an assigned mentor
    if (project.mentor) {
      return res.status(400).json({ message: 'This project already has an assigned faculty mentor.' });
    }

    // Check for existing pending request to this faculty member
    const existingActiveRequest = await MentorRequest.findOne({
      project: project._id,
      requestedFaculty: faculty._id,
      status: 'pending',
    });

    if (existingActiveRequest) {
      return res.status(400).json({ message: 'An active mentorship request is already pending with this faculty member.' });
    }

    const mentorRequest = await MentorRequest.create({
      project: project._id,
      team: team._id,
      requestedFaculty: faculty._id,
      studentMessage: studentMessage ? studentMessage.trim() : '',
      status: 'pending',
    });

    // Notify the faculty member
    await createNotification({
      recipient: faculty._id,
      type: 'mentor_request_received',
      title: 'New Mentorship Request',
      message: `Team "${team.name}" requested your mentorship for "${project.title}".`,
      resourceType: 'MentorRequest',
      resourceId: mentorRequest._id,
      link: '/faculty/requests',
    });

    await logAudit({
      actor: req.user,
      action: 'MENTOR_REQUEST_CREATED',
      resourceType: 'MentorRequest',
      resourceId: mentorRequest._id,
      metadata: { project: project.title, faculty: faculty.name },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Mentorship request submitted successfully.',
      mentorRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get mentor requests based on role
export const getMentorRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (req.user.role === 'student') {
      const myTeam = await Team.findOne({
        $or: [{ leader: req.user._id }, { 'members.user': req.user._id }],
      });
      if (!myTeam) {
        return res.json({ requests: [] });
      }
      query.team = myTeam._id;
    } else if (req.user.role === 'faculty') {
      query.requestedFaculty = req.user._id;
    }
    // Admin sees all

    const requests = await MentorRequest.find(query)
      .populate({
        path: 'project',
        select: 'title abstract domain technologies status submissionVersion',
      })
      .populate({
        path: 'team',
        select: 'name leader members',
        populate: { path: 'leader', select: 'name email department studentId' },
      })
      .populate('requestedFaculty', 'name email department expertise profileImage')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

// Faculty decision on mentor request
export const handleRequestDecision = async (req, res, next) => {
  try {
    const { decision, feedback } = req.body; // 'approved', 'rejected', 'changes_requested'
    const request = await MentorRequest.findById(req.params.id)
      .populate('project')
      .populate('team');

    if (!request) {
      return res.status(404).json({ message: 'Mentorship request not found.' });
    }

    // Authorization: only the requested faculty or admin can decide
    if (request.requestedFaculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to act on this mentorship request.' });
    }

    if (!['approved', 'rejected', 'changes_requested'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision option.' });
    }

    request.status = decision;
    request.facultyFeedback = feedback ? feedback.trim() : '';
    request.decisionAt = new Date();
    await request.save();

    const project = await Project.findById(request.project._id);

    if (decision === 'approved') {
      project.mentor = req.user._id;
      project.status = 'approved';
      if (project.progress === 0) project.progress = 15;
      project.approvalHistory.push({
        status: 'approved',
        updatedBy: req.user._id,
        feedback: feedback || 'Mentorship accepted and project proposal approved.',
        updatedAt: new Date(),
      });
      await project.save();

      // Cancel any other pending requests for this project
      await MentorRequest.updateMany(
        { project: project._id, _id: { $ne: request._id }, status: 'pending' },
        { status: 'cancelled', facultyFeedback: 'Project assigned to another faculty mentor.' }
      );
    } else if (decision === 'changes_requested') {
      project.status = 'changes_requested';
      project.approvalHistory.push({
        status: 'changes_requested',
        updatedBy: req.user._id,
        feedback: feedback || 'Revisions requested by faculty mentor.',
        updatedAt: new Date(),
      });
      await project.save();
    } else if (decision === 'rejected') {
      project.approvalHistory.push({
        status: 'rejected',
        updatedBy: req.user._id,
        feedback: feedback || 'Mentorship request declined.',
        updatedAt: new Date(),
      });
      await project.save();
    }

    // Notify all student team members
    const team = await Team.findById(request.team._id);
    if (team) {
      const recipientIds = [team.leader, ...team.members.map(m => m.user)];
      for (const studentId of recipientIds) {
        await createNotification({
          recipient: studentId,
          type: `mentor_request_${decision}`,
          title: `Mentor Request: ${decision.toUpperCase()}`,
          message: `${req.user.name} responded to your request: "${decision.replace('_', ' ')}"${feedback ? ` - ${feedback}` : ''}`,
          resourceType: 'MentorRequest',
          resourceId: request._id,
          link: `/student/projects/${project._id}`,
        });
      }
    }

    await logAudit({
      actor: req.user,
      action: `MENTOR_REQUEST_${decision.toUpperCase()}`,
      resourceType: 'MentorRequest',
      resourceId: request._id,
      metadata: { decision, project: project.title },
      ip: req.ip,
    });

    res.json({
      message: `Mentorship request has been ${decision}.`,
      request,
      project,
    });
  } catch (error) {
    next(error);
  }
};
