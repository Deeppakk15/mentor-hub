import Department from '../models/Department.js';
import AcademicSession from '../models/AcademicSession.js';
import ProjectDomain from '../models/ProjectDomain.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import MentorRequest from '../models/MentorRequest.js';
import AuditLog from '../models/AuditLog.js';
import { logAudit } from '../services/audit/auditService.js';

// --- DEPARTMENTS ---
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Department name and code are required.' });
    }

    const dept = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
    });

    await logAudit({
      actor: req.user,
      action: 'ADMIN_CREATE_DEPARTMENT',
      resourceType: 'Department',
      resourceId: dept._id,
      metadata: { code: dept.code, name: dept.name },
      ip: req.ip,
    });

    res.status(201).json({ message: 'Department created successfully', department: dept });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    if (name) dept.name = name.trim();
    if (code) dept.code = code.trim().toUpperCase();
    if (description !== undefined) dept.description = description.trim();

    await dept.save();
    res.json({ message: 'Department updated', department: dept });
  } catch (error) {
    next(error);
  }
};

// --- ACADEMIC SESSIONS ---
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await AcademicSession.find().sort({ startDate: -1 });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { name, startDate, endDate, proposalDeadline, reviewDeadline, finalSubmissionDeadline, isActive } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Session name, start date, and end date are required.' });
    }

    if (isActive) {
      // Deactivate other sessions
      await AcademicSession.updateMany({}, { isActive: false });
    }

    const session = await AcademicSession.create({
      name: name.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      proposalDeadline: proposalDeadline ? new Date(proposalDeadline) : null,
      reviewDeadline: reviewDeadline ? new Date(reviewDeadline) : null,
      finalSubmissionDeadline: finalSubmissionDeadline ? new Date(finalSubmissionDeadline) : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await logAudit({
      actor: req.user,
      action: 'ADMIN_CREATE_SESSION',
      resourceType: 'AcademicSession',
      resourceId: session._id,
      metadata: { name: session.name },
      ip: req.ip,
    });

    res.status(201).json({ message: 'Academic session created', session });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const session = await AcademicSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const { name, startDate, endDate, proposalDeadline, reviewDeadline, finalSubmissionDeadline, isActive } = req.body;

    if (name) session.name = name.trim();
    if (startDate) session.startDate = new Date(startDate);
    if (endDate) session.endDate = new Date(endDate);
    if (proposalDeadline !== undefined) session.proposalDeadline = proposalDeadline ? new Date(proposalDeadline) : null;
    if (reviewDeadline !== undefined) session.reviewDeadline = reviewDeadline ? new Date(reviewDeadline) : null;
    if (finalSubmissionDeadline !== undefined) session.finalSubmissionDeadline = finalSubmissionDeadline ? new Date(finalSubmissionDeadline) : null;

    if (isActive === true) {
      await AcademicSession.updateMany({ _id: { $ne: session._id } }, { isActive: false });
      session.isActive = true;
    } else if (isActive === false) {
      session.isActive = false;
    }

    await session.save();
    res.json({ message: 'Session updated', session });
  } catch (error) {
    next(error);
  }
};

// --- PROJECT DOMAINS ---
export const getDomains = async (req, res, next) => {
  try {
    const domains = await ProjectDomain.find().sort({ name: 1 });
    res.json({ domains });
  } catch (error) {
    next(error);
  }
};

export const createDomain = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Domain name is required.' });

    const domain = await ProjectDomain.create({
      name: name.trim(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({ message: 'Domain created', domain });
  } catch (error) {
    next(error);
  }
};

// --- FACULTY WORKLOAD OVERVIEW ---
export const getFacultyWorkload = async (req, res, next) => {
  try {
    const facultyList = await User.find({ role: 'faculty' }).select('-passwordHash').lean();

    const workloadData = await Promise.all(
      facultyList.map(async (faculty) => {
        const activeProjects = await Project.countDocuments({
          mentor: faculty._id,
          status: 'approved',
        });

        const completedProjects = await Project.countDocuments({
          mentor: faculty._id,
          status: 'completed',
        });

        const pendingRequests = await MentorRequest.countDocuments({
          requestedFaculty: faculty._id,
          status: 'pending',
        });

        const awaitingReview = await Project.countDocuments({
          mentor: faculty._id,
          status: { $in: ['submitted', 'under_review'] },
        });

        return {
          facultyId: faculty._id,
          name: faculty.name,
          email: faculty.email,
          department: faculty.department,
          expertise: faculty.expertise,
          activeProjects,
          completedProjects,
          pendingRequests,
          awaitingReview,
          totalLoad: activeProjects + awaitingReview,
        };
      })
    );

    res.json({ facultyWorkload: workloadData });
  } catch (error) {
    next(error);
  }
};

// --- AUDIT LOGS ---
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, page = 1, limit = 50 } = req.query;
    let query = {};

    if (action) query.action = { $regex: action, $options: 'i' };
    if (resourceType) query.resourceType = resourceType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- EXPORT PROJECTS CSV ---
export const exportReportCsv = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('team', 'name')
      .populate('mentor', 'name email department')
      .lean();

    // CSV headers
    let csv = 'Project ID,Title,Domain,Status,Progress (%),Team Name,Mentor Name,Mentor Department,Final Score,Created At\n';

    projects.forEach((p) => {
      const row = [
        `"${p._id}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.domain || '').replace(/"/g, '""')}"`,
        `"${p.status}"`,
        p.progress || 0,
        `"${(p.team?.name || 'N/A').replace(/"/g, '""')}"`,
        `"${(p.mentor?.name || 'Unassigned').replace(/"/g, '""')}"`,
        `"${(p.mentor?.department || 'N/A').replace(/"/g, '""')}"`,
        p.finalScore !== null && p.finalScore !== undefined ? p.finalScore : 'N/A',
        `"${new Date(p.createdAt).toLocaleDateString()}"`,
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="mentorhub-projects-report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
