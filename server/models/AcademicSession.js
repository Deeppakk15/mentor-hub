import mongoose from 'mongoose';

const academicSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // e.g. "2025 - 2026 Academic Year"
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  proposalDeadline: {
    type: Date,
  },
  reviewDeadline: {
    type: Date,
  },
  finalSubmissionDeadline: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const AcademicSession = mongoose.model('AcademicSession', academicSessionSchema);
export default AcademicSession;
