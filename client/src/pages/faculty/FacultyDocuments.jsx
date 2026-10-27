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
  Download,
  CheckCircle,
  AlertCircle,
  FileArchive,
  MessageSquare,
} from 'lucide-react';

export const FacultyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('reviewed');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjectsAndDocs = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      const projs = projRes.data.projects || [];
      setProjects(projs);

      if (projs.length > 0) {
        const curId = selectedProjectId || projs[0]._id;
        setSelectedProjectId(curId);
        const docRes = await api.get(`/projects/${curId}/documents`);
        setDocuments(docRes.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndDocs();
  }, [selectedProjectId]);

  const handleOpenReview = (doc) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.reviewStatus || 'reviewed');
    setFeedback(doc.facultyFeedback || 'Reviewed. Format conforms to departmental submission guidelines.');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setSubmitting(true);
    try {
      await api.patch(`/documents/${selectedDoc._id}/review`, {
        reviewStatus,
        feedback,
      });
      toast.success('Document review submitted.');
      setShowReviewModal(false);
      fetchProjectsAndDocs();
    } catch (err) {
      toast.error('Failed to update document review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Deliverables & Document Review"
        description="Inspect submitted student technical reports, verify code archives, annotate document versions, and provide formal revision feedback."
        actions={
          projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title.slice(0, 36)}...
                </option>
              ))}
            </select>
          )
        }
      />

      <Card>
        <CardBody className="p-0">
          {documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Deliverable Filename</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Submitted By</th>
                    <th className="p-4">Review Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {doc.category === 'Source Code Archive' ? (
                            <FileArchive className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900">{doc.originalFilename}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px] text-slate-700">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        v{doc.version}.0
                      </td>
                      <td className="p-4 text-slate-600">
                        {doc.uploadedBy?.name || 'Student'}
                      </td>
                      <td className="p-4">
                        <Badge status={doc.reviewStatus} size="xs" />
                        {doc.facultyFeedback && (
                          <p className="text-[10px] text-indigo-600 mt-0.5 max-w-xs truncate italic">
                            "{doc.facultyFeedback}"
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.secureUrl}
                            download={doc.originalFilename}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <Button size="sm" variant="outline" onClick={() => handleOpenReview(doc)}>
                            Review
                          </Button>
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
                title="No Deliverables Uploaded by this Team"
                description="When the student team uploads project proposals, presentations, or source archives, they will show up here."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal: Document Review */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Student Deliverable"
        subtitle={`Document: ${selectedDoc?.originalFilename} (v${selectedDoc?.version}.0)`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Review Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewStatus('reviewed')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  reviewStatus === 'reviewed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Mark Reviewed
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus('revision_requested')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  reviewStatus === 'revision_requested'
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Request Revision
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback Comments for Student Team
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Save Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
