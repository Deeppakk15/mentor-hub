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
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const FacultyMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Outcome Modal
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/meetings');
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleConfirmMeeting = async (meetingId) => {
    try {
      await api.patch(`/meetings/${meetingId}`, { status: 'confirmed' });
      toast.success('Meeting confirmed. Student team notified.');
      fetchMeetings();
    } catch (err) {
      toast.error('Failed to confirm meeting.');
    }
  };

  const handleOpenOutcome = (meeting) => {
    setSelectedMeeting(meeting);
    setOutcome(meeting.outcome || 'Discussed circuit constraint equations and verified gas optimization test suite.');
    setShowOutcomeModal(true);
  };

  const handleSubmitOutcome = async (e) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    setSubmitting(true);
    try {
      await api.patch(`/meetings/${selectedMeeting._id}`, {
        status: 'completed',
        outcome,
      });
      toast.success('Meeting marked as Completed and outcome notes saved.');
      setShowOutcomeModal(false);
      fetchMeetings();
    } catch (err) {
      toast.error('Failed to record meeting outcome.');
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
        title="Student Mentorship Meetings"
        description="Review sync requests from capstone project teams, confirm meeting schedules, and record official discussion outcomes."
      />

      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map((m) => (
            <Card key={m._id} className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge status={m.status} size="xs" />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.project?.title || 'Capstone Sync'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(m.scheduledAt).toLocaleString()} ({m.duration} mins)
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                  <p className="text-xs text-slate-500">
                    Requested by: <strong>{m.requestedBy?.name}</strong> ({m.requestedBy?.department})
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-800 block mb-0.5">Student Agenda:</span>
                    {m.agenda}
                  </div>

                  {m.outcome && (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                      <span className="font-bold block mb-0.5">Recorded Meeting Outcome:</span>
                      {m.outcome}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  {m.status === 'pending' && (
                    <Button size="sm" onClick={() => handleConfirmMeeting(m._id)}>
                      Confirm Meeting
                    </Button>
                  )}

                  {m.status !== 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => handleOpenOutcome(m)}>
                      Record Outcome
                    </Button>
                  )}

                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Meet
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-10">
              <EmptyState
                icon={Calendar}
                title="No Meetings Scheduled"
                description="When your mentored student teams request sync check-ins, they will appear here."
              />
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Record Outcome */}
      <Modal
        isOpen={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
        title="Record Meeting Outcome & Action Items"
        subtitle={`Meeting: ${selectedMeeting?.title}`}
      >
        <form onSubmit={handleSubmitOutcome} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discussion Summary & Assigned Next Steps
            </label>
            <textarea
              rows={4}
              required
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowOutcomeModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Save Outcome & Complete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
