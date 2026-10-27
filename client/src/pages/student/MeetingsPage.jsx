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
  Plus,
  Video,
  Clock,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: 'Project Progress Sync & Code Review',
    scheduledAt: '',
    duration: 30,
    agenda: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, meetRes] = await Promise.all([
        api.get('/projects'),
        api.get('/meetings'),
      ]);
      if (projRes.data.projects?.length > 0) {
        setProject(projRes.data.projects[0]);
      }
      setMeetings(meetRes.data.meetings || []);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!meetingForm.scheduledAt || !meetingForm.agenda.trim() || !project) return;

    if (!project.mentor) {
      toast.error('You must have an assigned faculty mentor before requesting a meeting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/meetings', {
        projectId: project._id,
        ...meetingForm,
      });
      toast.success('Meeting requested with your faculty mentor.');
      setShowScheduleModal(false);
      setMeetingForm({
        title: 'Project Progress Sync & Code Review',
        scheduledAt: '',
        duration: 30,
        agenda: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledAt) >= new Date() && m.status !== 'cancelled');
  const pastMeetings = meetings.filter(m => new Date(m.scheduledAt) < new Date() || m.status === 'completed');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Sync Meetings"
        description="Schedule bi-weekly sync check-ins, record discussion agendas, and track meeting outcomes with your assigned faculty mentor."
        actions={
          <Button icon={Plus} size="sm" onClick={() => setShowScheduleModal(true)}>
            Schedule Sync
          </Button>
        }
      />

      {/* Upcoming Meetings List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Scheduled & Upcoming Syncs ({upcomingMeetings.length})
        </h3>
        {upcomingMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMeetings.map((m) => (
              <Card key={m._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <Badge status={m.status} size="xs" />
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {m.duration} mins
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{m.title}</h4>
                  <p className="text-xs text-slate-600 mb-3">
                    Faculty: <strong>{m.faculty?.name}</strong> ({m.faculty?.department})
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-800 block mb-0.5">Discussion Agenda:</span>
                    {m.agenda}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {new Date(m.scheduledAt).toLocaleString()}
                  </div>
                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-8 text-center text-xs text-slate-500">
              No upcoming sync meetings scheduled with your faculty mentor.
            </div>
          </Card>
        )}
      </div>

      {/* Past Meetings with Outcomes */}
      {pastMeetings.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Past Meetings & Action Items ({pastMeetings.length})
          </h3>
          <div className="space-y-3">
            {pastMeetings.map((m) => (
              <Card key={m._id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{m.title}</span>
                      <Badge status={m.status} size="xs" />
                    </div>
                    <p className="text-xs text-slate-500">
                      Conducted with {m.faculty?.name} on {new Date(m.scheduledAt).toLocaleDateString()}
                    </p>

                    {m.outcome && (
                      <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-900">
                        <span className="font-bold block mb-0.5">Agreed Outcome & Next Steps:</span>
                        {m.outcome}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Schedule Meeting */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Request Faculty Sync Meeting"
        subtitle={`Request an online or in-person sync with ${project?.mentor?.name || 'Faculty Mentor'}`}
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={meetingForm.scheduledAt}
                onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={meetingForm.duration}
                onChange={(e) => setMeetingForm({ ...meetingForm, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={15}>15 minutes (Quick Standup)</option>
                <option value={30}>30 minutes (Standard Sync)</option>
                <option value={45}>45 minutes (In-depth Review)</option>
                <option value={60}>60 minutes (Comprehensive Demo)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discussion Agenda & Questions
            </label>
            <textarea
              rows={3}
              required
              placeholder="Outline specific technical bottlenecks, code review requests, or architectural decisions to discuss..."
              value={meetingForm.agenda}
              onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Request Meeting
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
