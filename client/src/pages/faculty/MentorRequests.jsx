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
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MentorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionType, setDecisionType] = useState('approved'); // 'approved' | 'rejected' | 'changes_requested'
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentor-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to load mentor requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDecision = (req, type) => {
    setSelectedRequest(req);
    setDecisionType(type);
    if (type === 'approved') {
      setFeedback('Proposal accepted. The research objectives and tech stack align well with departmental guidelines. Proceed with milestone backlog.');
    } else if (type === 'changes_requested') {
      setFeedback('Please elaborate on circuit constraint scaling and provide an explicit architecture sequence diagram before re-submitting.');
    } else {
      setFeedback('Unable to mentor this semester due to reaching maximum capstone project supervision capacity.');
    }
    setShowModal(true);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      await api.patch(`/mentor-requests/${selectedRequest._id}/decision`, {
        decision: decisionType,
        feedback,
      });
      toast.success(`Mentorship request marked as ${decisionType.replace('_', ' ')}.`);
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record decision.');
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
        title="Mentorship Requests & Proposals"
        description="Review incoming student project proposals, evaluate domain alignment, provide feedback, and approve capstone mentorship assignments."
      />

      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <Card key={req._id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge status={req.status} size="sm" />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Team: {req.team?.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Received {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {req.project?.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Team Lead: <strong>{req.team?.leader?.name}</strong> ({req.team?.leader?.email})
                    </p>
                  </div>

                  {req.studentMessage && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                      <span className="font-bold text-slate-800 not-italic block mb-0.5">Student Note:</span>
                      "{req.studentMessage}"
                    </div>
                  )}

                  {req.project?.abstract && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      <strong>Abstract:</strong> {req.project.abstract}
                    </p>
                  )}

                  {/* Tech stack */}
                  {req.project?.technologies && req.project.technologies.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">Proposed Stack:</span>
                      {req.project.technologies.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Existing Faculty Feedback if already decided */}
                  {req.facultyFeedback && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
                      <span className="font-bold block mb-0.5">Your Decision Feedback:</span>
                      "{req.facultyFeedback}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
                    <Button
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleOpenDecision(req, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Approve & Mentor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={AlertCircle}
                      onClick={() => handleOpenDecision(req, 'changes_requested')}
                    >
                      Request Revisions
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => handleOpenDecision(req, 'rejected')}
                    >
                      Decline Request
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-10">
              <EmptyState
                icon={UserCheck}
                title="No Pending Mentorship Requests"
                description="When student teams discover your profile and submit capstone proposals for your guidance, they will appear here."
              />
            </div>
          </Card>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Decision: ${decisionType.replace('_', ' ').toUpperCase()}`}
        subtitle={`Proposal: ${selectedRequest?.project?.title}`}
      >
        <form onSubmit={handleSubmitDecision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Faculty Comments & Action Items for Student Team
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={submitting}
              className={decisionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              Confirm Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
