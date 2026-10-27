import mongoose from 'mongoose';

const projectDomainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  projectCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const ProjectDomain = mongoose.model('ProjectDomain', projectDomainSchema);
export default ProjectDomain;
