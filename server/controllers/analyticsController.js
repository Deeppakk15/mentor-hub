import User from '../models/User.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import MentorRequest from '../models/MentorRequest.js';
import Meeting from '../models/Meeting.js';
import Evaluation from '../models/Evaluation.js';

// Student Dashboard Analytics
export const getStudentAnalytics = async (req, res, next) => {
  try {
    const myTeam = await Team.findOne({
      $or: [{ leader: req.user._id }, { 'members.user': req.user._id }],
    });

    if (!myTeam) {
      return res.json({
        hasTeam: false,
        activeProjects: 0,
        pendingMentorRequests: 0,
        completedMilestones: 0,
        pendingTasks: 0,
        project: null,
        recentTasks: [],
        upcomingDeadlines: [],
      });
    }

    const project = await Project.findOne({ team: myTeam._id })
      .populate('mentor', 'name email department profileImage')
      .populate('team', 'name leader members');

    const pendingRequests = await MentorRequest.countDocuments({
      team: myTeam._id,
      status: 'pending',
    });

    let completedMilestones = 0;
    let pendingTasks = 0;
    let recentTasks = [];
    let upcomingDeadlines = [];

    if (project) {
      completedMilestones = await Milestone.countDocuments({
        project: project._id,
        status: 'approved',
      });

      pendingTasks = await Task.countDocuments({
        project: project._id,
        status: { $ne: 'completed' },
      });

      recentTasks = await Task.find({ project: project._id })
        .populate('assignee', 'name')
        .sort({ dueDate: 1 })
        .limit(6);

      const milestonesWithDates = await Milestone.find({
        project: project._id,
        status: { $ne: 'approved' },
        targetDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).sort({ targetDate: 1 }).limit(4);

      upcomingDeadlines = milestonesWithDates.map(m => ({
        title: m.title,
        date: m.targetDate,
        type: 'Milestone',
        status: m.status,
      }));
    }

    res.json({
      hasTeam: true,
      activeProjects: project && project.status === 'approved' ? 1 : (project ? 1 : 0),
      pendingMentorRequests: pendingRequests,
      completedMilestones,
      pendingTasks,
      project,
      recentTasks,
      upcomingDeadlines,
    });
  } catch (error) {
    next(error);
  }
};

// Faculty Dashboard Analytics
export const getFacultyAnalytics = async (req, res, next) => {
  try {
    const activeProjects = await Project.countDocuments({
      mentor: req.user._id,
      status: 'approved',
    });

    const pendingRequests = await MentorRequest.countDocuments({
      requestedFaculty: req.user._id,
      status: 'pending',
    });

    const awaitingReview = await Project.countDocuments({
      mentor: req.user._id,
      status: { $in: ['submitted', 'under_review'] },
    });

    const upcomingMeetings = await Meeting.countDocuments({
      faculty: req.user._id,
      scheduledAt: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
    });

    const pendingEvaluations = await Project.countDocuments({
      mentor: req.user._id,
      status: 'approved',
      finalScore: null,
      progress: { $gte: 90 },
    });

    const mentoredProjects = await Project.find({ mentor: req.user._id })
      .populate('team', 'name leader')
      .sort({ updatedAt: -1 })
      .limit(6);

    const upcomingMeetingList = await Meeting.find({
      faculty: req.user._id,
      scheduledAt: { $gte: new Date() },
    })
      .populate('project', 'title')
      .populate('requestedBy', 'name email')
      .sort({ scheduledAt: 1 })
      .limit(4);

    res.json({
      activeProjects,
      pendingRequests,
      awaitingReview,
      upcomingMeetings,
      pendingEvaluations,
      mentoredProjects,
      upcomingMeetingList,
    });
  } catch (error) {
    next(error);
  }
};

// Admin Dashboard Analytics
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'approved' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const pendingApprovals = await Project.countDocuments({ status: { $in: ['submitted', 'under_review'] } });

    // Aggregate Projects by Domain
    const domainAggregation = await Project.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const projectsByDomain = domainAggregation.map(d => ({
      name: d._id || 'Unassigned',
      value: d.count,
    }));

    // Aggregate Projects by Status
    const statusAggregation = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const projectsByStatus = statusAggregation.map(s => ({
      status: s._id,
      count: s.count,
    }));

    // Aggregate Users by Department
    const departmentAggregation = await User.aggregate([
      { $match: { department: { $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const usersByDepartment = departmentAggregation.map(dep => ({
      name: dep._id,
      count: dep.count,
    }));

    // Recent activity list
    const recentProjects = await Project.find()
      .populate('team', 'name')
      .populate('mentor', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      totalStudents,
      totalFaculty,
      totalProjects,
      activeProjects,
      completedProjects,
      pendingApprovals,
      projectsByDomain,
      projectsByStatus,
      usersByDepartment,
      recentProjects,
    });
  } catch (error) {
    next(error);
  }
};
