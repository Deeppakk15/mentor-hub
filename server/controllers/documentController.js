import Document from '../models/Document.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import { getFileDownloadPath } from '../services/storage/storageService.js';
import { createNotification } from '../services/notifications/notificationService.js';
import fs from 'fs';

// Upload a project document with versioning
export const uploadDocument = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const project = await Project.findById(projectId).populate('team');
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Role-based authorization
    if (req.user.role === 'student') {
      const isMember = project.team?.members?.some(
        m => m.user.toString() === req.user._id.toString()
      ) || project.team?.leader.toString() === req.user._id.toString();

      if (!isMember) {
        return res.status(403).json({ message: 'Access denied: You are not authorized to upload documents for this project.' });
      }
    }

    // Check for previous version in the same category
    const previousDoc = await Document.findOne({
      project: projectId,
      category: category || 'Other',
    }).sort({ version: -1 });

    const newVersion = previousDoc ? previousDoc.version + 1 : 1;

    const document = await Document.create({
      project: projectId,
      uploadedBy: req.user._id,
      category: category || 'Other',
      originalFilename: req.file.originalname,
      storageKey: req.file.filename,
      secureUrl: `/api/documents/download/${req.file.filename}`,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      version: newVersion,
      previousVersion: previousDoc ? previousDoc._id : null,
      reviewStatus: 'pending',
    });

    // Notify faculty mentor if exists
    if (project.mentor) {
      await createNotification({
        recipient: project.mentor,
        type: 'document_uploaded',
        title: 'New Document Uploaded',
        message: `${req.user.name} uploaded ${category || 'document'} (v${newVersion}) for "${project.title}".`,
        resourceType: 'Document',
        resourceId: document._id,
        link: `/faculty/documents`,
      });
    }

    const populatedDoc = await Document.findById(document._id).populate('uploadedBy', 'name role');

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: populatedDoc,
    });
  } catch (error) {
    next(error);
  }
};

// Get documents for project
export const getProjectDocuments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { category } = req.query;

    let query = { project: projectId };
    if (category && category !== 'All') {
      query.category = category;
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name role email')
      .populate('previousVersion', 'version originalFilename createdAt')
      .sort({ createdAt: -1 });

    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

// Secure file download
export const downloadDocument = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = getFileDownloadPath(filename);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on storage server.' });
    }

    const docRecord = await Document.findOne({ storageKey: filename });
    const downloadName = docRecord ? docRecord.originalFilename : filename;

    res.download(filePath, downloadName);
  } catch (error) {
    next(error);
  }
};

// Faculty reviews document
export const reviewDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewStatus, feedback } = req.body;

    const document = await Document.findById(id).populate('project');
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (reviewStatus) document.reviewStatus = reviewStatus;
    if (feedback !== undefined) document.facultyFeedback = feedback.trim();

    await document.save();

    // Notify student uploader
    await createNotification({
      recipient: document.uploadedBy,
      type: 'document_reviewed',
      title: 'Document Review Update',
      message: `Your document "${document.originalFilename}" was marked as ${reviewStatus || 'reviewed'}. ${feedback ? `Feedback: "${feedback}"` : ''}`,
      resourceType: 'Document',
      resourceId: document._id,
      link: `/student/documents`,
    });

    res.json({
      message: 'Document review submitted successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Delete document
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Permission: Only uploader or admin can delete
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this document.' });
    }

    // Attempt physical cleanup
    const filePath = getFileDownloadPath(document.storageKey);
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete physical file:', err.message);
      }
    }

    await Document.findByIdAndDelete(id);

    res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
