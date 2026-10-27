import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student',
    required: true,
  },
  department: {
    type: String,
    trim: true,
    default: 'Computer Science & Engineering',
  },
  profileImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  expertise: [{
    type: String,
    trim: true,
  }],
  researchInterests: [{
    type: String,
    trim: true,
  }],
  studentId: {
    type: String,
    trim: true,
    default: '',
  },
  employeeId: {
    type: String,
    trim: true,
    default: '',
  },
  academicYear: {
    type: String,
    trim: true,
    default: '4th Year',
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe user representation (omit sensitive hash)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
