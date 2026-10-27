import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';
import { toast } from 'sonner';
import { CalendarDays, Plus, Clock, CheckCircle } from 'lucide-react';

export const AcademicSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    proposalDeadline: '',
    reviewDeadline: '',
    finalSubmissionDeadline: '',
    isActive: true,
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sessionForm.name || !sessionForm.startDate || !sessionForm.endDate) return;

    setSubmitting(true);
    try {
      await api.post('/admin/sessions', sessionForm);
      toast.success('Academic session configured.');
      setShowModal(false);
      setSessionForm({
        name: '',
        startDate: '',
        endDate: '',
        proposalDeadline: '',
        reviewDeadline: '',
        finalSubmissionDeadline: '',
        isActive: true,
      });
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create academic session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (sessionId) => {
    try {
      await api.patch(`/admin/sessions/${sessionId}`, { isActive: true });
      toast.success('Active academic session updated.');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to set active session.');
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Academic Sessions & Milestone Deadlines"
        description="Establish semester start and end dates, configure proposal intake windows, review periods, and final submission cutoffs."
        actions={
          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            New Academic Session
          </Button>
        }
      />

      <div className="space-y-4">
        {sessions.map((s) => (
          <Card key={s._id} className={s.isActive ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={s.isActive ? 'active' : 'inactive'} size="xs">
                      {s.isActive ? 'Active Session' : 'Archived'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{s.name}</h3>
                </div>

                {!s.isActive && (
                  <Button size="sm" variant="outline" onClick={() => handleSetActive(s._id)}>
                    Set as Active Session
                  </Button>
                )}
              </div>

              {/* Deadlines Grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Proposal Intake Deadline
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {s.proposalDeadline ? new Date(s.proposalDeadline).toLocaleDateString() : 'Unscheduled'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Faculty Review Cutoff
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {s.reviewDeadline ? new Date(s.reviewDeadline).toLocaleDateString() : 'Unscheduled'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Final Viva Defense Cutoff
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {s.finalSubmissionDeadline ? new Date(s.finalSubmissionDeadline).toLocaleDateString() : 'Unscheduled'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Configure Academic Session"
        subtitle="Specify official start/end dates and institutional proposal cutoffs"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 - 2027 Academic Year"
              value={sessionForm.name}
              onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={sessionForm.startDate}
                onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={sessionForm.endDate}
                onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposal Submission Deadline
              </label>
              <input
                type="date"
                value={sessionForm.proposalDeadline}
                onChange={(e) => setSessionForm({ ...sessionForm, proposalDeadline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Final Deliverable Deadline
              </label>
              <input
                type="date"
                value={sessionForm.finalSubmissionDeadline}
                onChange={(e) => setSessionForm({ ...sessionForm, finalSubmissionDeadline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Save Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
