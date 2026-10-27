import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  criteria: [{
    name: {
      type: String,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      default: '',
    },
  }],
  totalScore: {
    type: Number,
    required: true,
    default: 0,
  },
  maxTotalScore: {
    type: Number,
    default: 100,
  },
  feedback: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;
