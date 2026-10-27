import mongoose from 'mongoose';

const mentorRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  requestedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentMessage: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'changes_requested', 'cancelled'],
    default: 'pending',
  },
  facultyFeedback: {
    type: String,
    default: '',
    trim: true,
  },
  decisionAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index to prevent duplicate pending requests from same project to same faculty
mentorRequestSchema.index({ project: 1, requestedFaculty: 1, status: 1 });

const MentorRequest = mongoose.model('MentorRequest', mentorRequestSchema);
export default MentorRequest;
