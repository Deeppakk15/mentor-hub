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
  Milestone,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const MilestonesPage = () => {
  const [milestones, setMilestones] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  const [evidenceForm, setEvidenceForm] = useState({
    title: '',
    url: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      if (projRes.data.projects?.length > 0) {
        const curProject = projRes.data.projects[0];
        setProject(curProject);

        const mileRes = await api.get(`/projects/${curProject._id}/milestones`);
        setMilestones(mileRes.data.milestones || []);
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title || !milestoneForm.targetDate || !project) return;

    setSubmitting(true);
    try {
      await api.post(`/projects/${project._id}/milestones`, milestoneForm);
      toast.success('Milestone checkpoint created.');
      setShowCreateModal(false);
      setMilestoneForm({ title: '', description: '', targetDate: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceForm.title || !evidenceForm.url || !selectedMilestone) return;

    setSubmitting(true);
    try {
      await api.patch(`/milestones/${selectedMilestone._id}`, {
        evidence: evidenceForm,
      });
      toast.success('Milestone evidence submitted for faculty review.');
      setShowEvidenceModal(false);
      setEvidenceForm({ title: '', url: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  if (!project) {
    return (
      <EmptyState
        icon={Milestone}
        title="No Project Found"
        description="Please initiate a project proposal first before scheduling milestone checkpoints."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Milestones & Deliverables"
        description={`Track semester target dates and submit evidence for faculty sign-off on: ${project.title}`}
        actions={
          <Button icon={Plus} size="sm" onClick={() => setShowCreateModal(true)}>
            Add Milestone
          </Button>
        }
      />

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {milestones.length > 0 ? (
          milestones.map((m, idx) => (
            <Card key={m._id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    m.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge status={m.status} size="sm" />
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Target: {new Date(m.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{m.title}</h3>
                    {m.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                        {m.description}
                      </p>
                    )}

                    {/* Evidence Documents Submitted */}
                    {m.evidenceDocuments && m.evidenceDocuments.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Submitted Milestone Evidence
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {m.evidenceDocuments.map((ev, i) => (
                            <a
                              key={i}
                              href={ev.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-indigo-600 border border-slate-200 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span>{ev.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Faculty Feedback */}
                    {m.facultyFeedback && (
                      <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs">
                        <span className="font-bold text-indigo-900 block mb-0.5">Faculty Feedback:</span>
                        <span className="text-indigo-800 leading-relaxed italic">"{m.facultyFeedback}"</span>
                        {m.approvedBy && (
                          <span className="text-[10px] text-indigo-500 block mt-1">
                            Evaluated by: {m.approvedBy?.name} on {new Date(m.approvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {m.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMilestone(m);
                        setShowEvidenceModal(true);
                      }}
                    >
                      Submit Evidence
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-8">
              <EmptyState
                icon={Milestone}
                title="No Milestones Defined Yet"
                description="Add structured checkpoints (e.g. Mid-term prototype, architecture design, final defense) to track your capstone deliverables."
                actionLabel="Create Milestone"
                onAction={() => setShowCreateModal(true)}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Create Milestone */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Project Milestone"
        subtitle="Specify checkpoint title, requirements, and semester target date"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Milestone Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Milestone 2: Hardhat Prototype & Sepolia Testnet Deployment"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Verification Criteria
            </label>
            <textarea
              rows={3}
              placeholder="Detail what concrete deliverables must be demonstrated for sign-off..."
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Deadline Date
            </label>
            <input
              type="date"
              required
              value={milestoneForm.targetDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Add Milestone
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Submit Evidence */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        title={`Submit Evidence: ${selectedMilestone?.title}`}
        subtitle="Provide link to deployment demo, report document, or code repository"
      >
        <form onSubmit={handleSubmitEvidence} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evidence Document / Report Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Testnet_Transaction_Audit_Log.pdf"
              value={evidenceForm.title}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document URL / Storage Download Link
            </label>
            <input
              type="text"
              required
              placeholder="https://... or /uploads/report.pdf"
              value={evidenceForm.url}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, url: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowEvidenceModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting} icon={Send}>
              Submit for Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
