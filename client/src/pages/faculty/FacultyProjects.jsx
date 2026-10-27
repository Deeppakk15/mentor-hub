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
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Award,
  Users,
} from 'lucide-react';

export const FacultyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Milestone Approval Modal
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [facultyFeedback, setFacultyFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenMilestoneReview = (milestone) => {
    setSelectedMilestone(milestone);
    setReviewStatus('approved');
    setFacultyFeedback('Deliverables verified. Smart contracts and evidence documentation fulfill milestone requirements.');
    setShowApprovalModal(true);
  };

  const handleSubmitMilestoneReview = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    setSubmitting(true);
    try {
      await api.patch(`/milestones/${selectedMilestone._id}`, {
        status: reviewStatus,
        facultyFeedback,
      });
      toast.success(`Milestone has been marked as ${reviewStatus}.`);
      setShowApprovalModal(false);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to submit milestone review.');
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
        title="Mentored Capstone Projects"
        description="Oversee project progression, inspect submitted deliverables, evaluate milestone checkpoints, and guide student teams."
      />

      <div className="space-y-6">
        {projects.length > 0 ? (
          projects.map((proj) => (
            <Card key={proj._id}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={proj.status} size="sm" />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {proj.domain}
                      </span>
                      <span className="text-xs text-slate-500">
                        Team: <strong>{proj.team?.name}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{proj.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl line-clamp-2">{proj.abstract}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to="/faculty/evaluations">
                      <Button size="sm" icon={Award} variant="outline">
                        Evaluate & Grade
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1.5 text-slate-600">
                    <span className="font-semibold">Capstone Completion Status</span>
                    <span className="font-bold text-indigo-600 font-mono">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tech tags & Team Members */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400 font-medium">Stack:</span>
                    {proj.technologies?.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Lead: <strong>{proj.team?.leader?.name || 'Student Lead'}</strong></span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-10">
              <EmptyState
                icon={FolderKanban}
                title="No Mentored Projects Assigned"
                description="When you approve mentorship requests submitted by student teams, their projects will appear here."
              />
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Milestone Review */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Faculty Milestone Review"
        subtitle={`Milestone: ${selectedMilestone?.title}`}
      >
        <form onSubmit={handleSubmitMilestoneReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Review Decision
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewStatus('approved')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  reviewStatus === 'approved'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Approve Milestone
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus('changes_requested')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  reviewStatus === 'changes_requested'
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Request Changes
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Faculty Comments & Guidance
            </label>
            <textarea
              rows={4}
              required
              value={facultyFeedback}
              onChange={(e) => setFacultyFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
