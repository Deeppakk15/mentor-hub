import Meeting from '../models/Meeting.js';
import Project from '../models/Project.js';
import { createNotification } from '../services/notifications/notificationService.js';

// Get meetings for current user
export const getMeetings = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      // Find meetings requested by this student or related to projects in student's team
      query.$or = [
        { requestedBy: req.user._id },
      ];
    } else if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    }
    // Admin sees all

    const meetings = await Meeting.find(query)
      .populate('project', 'title domain status')
      .populate('requestedBy', 'name email department')
      .populate('faculty', 'name email department')
      .sort({ scheduledAt: 1 });

    res.json({ meetings });
  } catch (error) {
    next(error);
  }
};

// Schedule a meeting
export const createMeeting = async (req, res, next) => {
  try {
    const { projectId, scheduledAt, duration, agenda, title, meetingLink } = req.body;

    if (!projectId || !scheduledAt || !agenda) {
      return res.status(400).json({ message: 'Project ID, scheduled date/time, and agenda are required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!project.mentor) {
      return res.status(400).json({ message: 'Cannot schedule a mentor meeting until a faculty mentor is assigned.' });
    }

    const meetingDate = new Date(scheduledAt);
    if (isNaN(meetingDate.getTime())) {
      return res.status(400).json({ message: 'Invalid meeting date or time.' });
    }

    const meeting = await Meeting.create({
      project: projectId,
      requestedBy: req.user._id,
      faculty: project.mentor,
      title: title || 'Project Progress Sync',
      scheduledAt: meetingDate,
      duration: duration || 30,
      agenda: agenda.trim(),
      meetingLink: meetingLink || 'https://meet.google.com/mentorhub-sync',
      status: req.user.role === 'faculty' ? 'confirmed' : 'pending',
    });

    // Notify other party
    const targetRecipient = req.user.role === 'faculty' ? project.team?.leader : project.mentor;
    if (targetRecipient) {
      await createNotification({
        recipient: targetRecipient,
        type: 'meeting_scheduled',
        title: 'Meeting Scheduled',
        message: `${req.user.name} scheduled a meeting for "${project.title}" on ${meetingDate.toLocaleDateString()}.`,
        resourceType: 'Meeting',
        resourceId: meeting._id,
        link: req.user.role === 'faculty' ? '/student/meetings' : '/faculty/meetings',
      });
    }

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('project', 'title domain')
      .populate('requestedBy', 'name email')
      .populate('faculty', 'name email');

    res.status(201).json({
      message: 'Meeting requested successfully',
      meeting: populatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

// Update meeting status or record outcome
export const updateMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, outcome, scheduledAt, duration, meetingLink } = req.body;

    const meeting = await Meeting.findById(id).populate('project');
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found.' });
    }

    if (status) meeting.status = status;
    if (outcome !== undefined) meeting.outcome = outcome.trim();
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);
    if (duration) meeting.duration = duration;
    if (meetingLink) meeting.meetingLink = meetingLink;

    await meeting.save();

    // Notify requestedBy if faculty confirmed or added outcome
    if (meeting.requestedBy.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: meeting.requestedBy,
        type: `meeting_${meeting.status}`,
        title: `Meeting ${meeting.status.toUpperCase()}`,
        message: outcome ? `Outcome recorded: "${outcome}"` : `Meeting status updated to ${meeting.status}.`,
        resourceType: 'Meeting',
        resourceId: meeting._id,
        link: '/student/meetings',
      });
    }

    res.json({
      message: 'Meeting updated successfully',
      meeting,
    });
  } catch (error) {
    next(error);
  }
};
