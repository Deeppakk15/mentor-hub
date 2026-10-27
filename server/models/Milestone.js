import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'changes_requested'],
    default: 'pending',
  },
  evidenceDocuments: [{
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  facultyFeedback: {
    type: String,
    default: '',
    trim: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
