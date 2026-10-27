import User from '../models/User.js';
import Project from '../models/Project.js';
import bcrypt from 'bcryptjs';
import { logAudit } from '../services/audit/auditService.js';

// Get Current User Profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update Current User Profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, department, expertise, researchInterests, profileImage, studentId, employeeId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (department) user.department = department.trim();
    if (expertise) user.expertise = Array.isArray(expertise) ? expertise : expertise.split(',').map(s => s.trim()).filter(Boolean);
    if (researchInterests) user.researchInterests = Array.isArray(researchInterests) ? researchInterests : researchInterests.split(',').map(s => s.trim()).filter(Boolean);
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (studentId !== undefined) user.studentId = studentId;
    if (employeeId !== undefined) user.employeeId = employeeId;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// Faculty Directory for Students
export const getFacultyList = async (req, res, next) => {
  try {
    const { search, department, expertise } = req.query;
    let query = { role: 'faculty', accountStatus: 'active' };

    if (search && search.trim() !== '') {
      const term = search.trim();
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titles = ['dr', 'dr.', 'prof', 'prof.', 'mr', 'mrs', 'ms'];
      const tokens = term
        .split(/\s+/)
        .filter(Boolean)
        .filter(t => !titles.includes(t.toLowerCase().replace(/\.$/, '')))
        .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

      query.$or = [
        { name: { $regex: escapedTerm, $options: 'i' } },
        { department: { $regex: escapedTerm, $options: 'i' } },
        { expertise: { $regex: escapedTerm, $options: 'i' } },
        { researchInterests: { $regex: escapedTerm, $options: 'i' } },
        { bio: { $regex: escapedTerm, $options: 'i' } },
        ...(tokens.length > 0 ? tokens.map(t => ({ name: { $regex: t, $options: 'i' } })) : []),
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (expertise && expertise !== 'All') {
      query.expertise = { $regex: expertise.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    let facultyMembers = await User.find(query).select('-passwordHash').lean();

    // Sort: faculty whose name starts with or closely matches search query appear first
    if (search && search.trim() !== '') {
      const lowerSearch = search.trim().toLowerCase();
      facultyMembers.sort((a, b) => {
        const aExact = a.name.toLowerCase().includes(lowerSearch);
        const bExact = b.name.toLowerCase().includes(lowerSearch);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      facultyMembers.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Attach active project count for each faculty member
    const facultyWithCounts = await Promise.all(
      facultyMembers.map(async (faculty) => {
        const activeProjectsCount = await Project.countDocuments({
          mentor: faculty._id,
          status: { $in: ['approved', 'under_review', 'submitted'] },
        });
        return {
          ...faculty,
          activeProjectsCount,
        };
      })
    );

    res.json({ faculty: facultyWithCounts });
  } catch (error) {
    next(error);
  }
};

// Get single faculty profile
export const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' }).select('-passwordHash').lean();
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    const projects = await Project.find({ mentor: faculty._id })
      .select('title domain status progress')
      .populate('team', 'name')
      .lean();

    res.json({ faculty, projects });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users with filters and pagination
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, department, status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') query.role = role;
    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.accountStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      users,
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

// Admin: Create user
export const createUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role, department, studentId, employeeId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      department: department || 'Computer Science & Engineering',
      studentId: studentId || '',
      employeeId: employeeId || '',
      accountStatus: 'active',
      expertise: role === 'faculty' ? ['Computer Science', 'Project Mentorship'] : [],
    });

    await logAudit({
      actor: req.user,
      action: 'ADMIN_CREATED_USER',
      resourceType: 'User',
      resourceId: newUser._id,
      metadata: { createdRole: newUser.role, createdEmail: newUser.email },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle account status (activate/deactivate)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Security: Protect last active administrator from accidental self-lockout
    if (targetUser.role === 'admin' && status === 'inactive') {
      const activeAdminCount = await User.countDocuments({ role: 'admin', accountStatus: 'active' });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot deactivate the only active administrator in the system.'
        });
      }
    }

    targetUser.accountStatus = status;
    await targetUser.save();

    await logAudit({
      actor: req.user,
      action: 'ADMIN_UPDATED_USER_STATUS',
      resourceType: 'User',
      resourceId: targetUser._id,
      metadata: { newStatus: status, targetEmail: targetUser.email },
      ip: req.ip,
    });

    res.json({
      message: `User account is now ${status}`,
      user: targetUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};
