import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Project Sync & Review',
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 30,
  },
  agenda: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  meetingLink: {
    type: String,
    default: 'https://meet.google.com/mentorhub-sync',
    trim: true,
  },
  outcome: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
