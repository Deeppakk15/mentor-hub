import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  abstract: {
    type: String,
    required: true,
    trim: true,
  },
  problemStatement: {
    type: String,
    default: '',
    trim: true,
  },
  objectives: {
    type: String,
    default: '',
    trim: true,
  },
  domain: {
    type: String,
    required: true,
    trim: true,
  },
  technologies: [{
    type: String,
    trim: true,
  }],
  expectedOutcomes: {
    type: String,
    default: '',
    trim: true,
  },
  references: {
    type: String,
    default: '',
    trim: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  academicSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSession',
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected', 'completed'],
    default: 'draft',
  },
  submissionVersion: {
    type: Number,
    default: 1,
  },
  approvalHistory: [{
    status: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    feedback: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  finalReportUrl: {
    type: String,
    default: '',
  },
  finalScore: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
