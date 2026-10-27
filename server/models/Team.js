import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: 'Developer',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  invitations: [{
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  academicSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSession',
  },
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
