import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Project Proposal',
      'Research Paper',
      'Progress Report',
      'Presentation',
      'Source Code Archive',
      'Final Report',
      'Other'
    ],
    default: 'Other',
    required: true,
  },
  originalFilename: {
    type: String,
    required: true,
  },
  storageKey: {
    type: String,
    required: true,
  },
  secureUrl: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    default: 'application/octet-stream',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  version: {
    type: Number,
    default: 1,
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'reviewed', 'revision_requested'],
    default: 'pending',
  },
  facultyFeedback: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
