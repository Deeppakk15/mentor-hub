import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { logAudit } from '../services/audit/auditService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, studentId, employeeId, academicYear } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Security: Prevent public registration as admin
    let assignedRole = role || 'student';
    if (assignedRole === 'admin') {
      // Check if any admin exists. If not, allow first user as admin (initial setup)
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        return res.status(403).json({
          message: 'Direct administrator registration is restricted. Please register as student or faculty, or contact an existing admin.'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      department: department || 'Computer Science & Engineering',
      studentId: studentId || '',
      employeeId: employeeId || '',
      academicYear: academicYear || '4th Year',
      expertise: assignedRole === 'faculty' ? ['Web Engineering', 'Cloud Computing', 'AI Systems'] : [],
    });

    const token = generateToken({
      userId: newUser._id,
      role: newUser.role,
      email: newUser.email,
    });

    await logAudit({
      actor: newUser,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: newUser._id,
      metadata: { role: newUser.role, email: newUser.email },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({ message: 'Account is deactivated or suspended. Please contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email,
    });

    await logAudit({
      actor: user,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      metadata: { role: user.role },
      ip: req.ip,
    });

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your registered college email.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Don't reveal whether user exists for security
    res.json({
      message: 'If an account exists with this email address, password reset instructions have been dispatched.',
      instructions: 'For development / demo mode, password can also be reset through the administrator panel or direct profile settings.'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};
