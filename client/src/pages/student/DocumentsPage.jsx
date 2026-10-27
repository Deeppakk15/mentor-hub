import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Filter,
  FileArchive,
  FileCode,
  FileCheck2,
  Clock,
  HardDrive,
} from 'lucide-react';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [category, setCategory] = useState('Progress Report');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Project Proposal',
    'Research Paper',
    'Progress Report',
    'Presentation',
    'Source Code Archive',
    'Final Report',
    'Other',
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      if (projRes.data.projects?.length > 0) {
        const curProj = projRes.data.projects[0];
        setProject(curProj);

        const docRes = await api.get(`/projects/${curProj._id}/documents`);
        setDocuments(docRes.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !project) {
      toast.error('Please select a valid document file.');
      return;
    }

    // Size limit check (25MB)
    if (uploadFile.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds maximum limit of 25MB.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', category);

    try {
      await api.post(`/projects/${project._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully.');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document removed.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete document.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false;
    return true;
  });

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  if (!project) {
    return (
      <EmptyState
        icon={FileText}
        title="No Project Found"
        description="Initiate a project proposal to access the document repository."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Repository & Version Control"
        description={`Manage project proposals, research papers, progress reports, and source code archives for: ${project.title}`}
        actions={
          <Button icon={Upload} size="sm" onClick={() => setShowUploadModal(true)}>
            Upload Document
          </Button>
        }
      />

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
        >
          <option value="All">All Categories ({documents.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardBody className="p-0">
          {filteredDocs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Document Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Uploaded By</th>
                    <th className="p-4">File Size</th>
                    <th className="p-4">Review Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            {doc.category === 'Source Code Archive' ? (
                              <FileArchive className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                              {doc.originalFilename}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        v{doc.version}.0
                      </td>
                      <td className="p-4 text-slate-600">
                        {doc.uploadedBy?.name || 'Team Member'}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="p-4">
                        <Badge status={doc.reviewStatus} size="xs" />
                        {doc.facultyFeedback && (
                          <span className="block text-[10px] text-indigo-600 italic mt-0.5 max-w-xs truncate">
                            Feedback: {doc.facultyFeedback}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={doc.secureUrl}
                            download={doc.originalFilename}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10">
              <EmptyState
                icon={FileText}
                title="No Documents Found in this Category"
                description="Upload project proposals, progress summaries, presentation decks, or compressed source code archives."
                actionLabel="Upload First Document"
                onAction={() => setShowUploadModal(true)}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal: Upload Document */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Project Deliverable"
        subtitle="Supported formats: PDF, Word, PowerPoint, ZIP archives (Max 25MB)"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deliverable Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select File to Upload
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                Uploading a document with an existing category automatically increments the version count.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting} icon={Upload}>
              Upload File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
