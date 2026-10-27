import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  UserCheck,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  Video,
  FileCheck2,
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/faculty');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load faculty analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/4 animate-pulse" />
        <SkeletonLoader count={4} type="stat" />
        <SkeletonLoader count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Faculty Dashboard: ${user?.name || 'Professor'}`}
        description="Monitor mentored projects, student requests, and scheduled meetings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/faculty/ai-assistant')}
            >
              Viva Questions
            </Button>
            <Button
              size="sm"
              icon={UserCheck}
              onClick={() => navigate('/faculty/requests')}
            >
              Requests ({analytics?.pendingRequests || 0})
            </Button>
          </div>
        }
      />

      {/* 4 Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mentored Projects"
          value={analytics?.activeProjects || 0}
          subtitle="Assigned projects"
          icon={FolderKanban}
          color="purple"
        />
        <StatCard
          title="Pending Requests"
          value={analytics?.pendingRequests || 0}
          subtitle="Needs response"
          icon={UserCheck}
          color="amber"
        />
        <StatCard
          title="Meetings"
          value={analytics?.upcomingMeetings || 0}
          subtitle="Scheduled check-ins"
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Evaluations"
          value={analytics?.pendingEvaluations || 0}
          subtitle="Awaiting marks"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Two Column Layout: Assigned Projects & Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Left 4 cols: Mentored Projects */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader
              title="Assigned Projects"
              subtitle="Projects currently under your mentorship"
              action={
                <Link to="/faculty/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  All Projects <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardBody className="p-0">
              {analytics?.mentoredProjects && analytics.mentoredProjects.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {analytics.mentoredProjects.map((proj) => (
                    <div key={proj._id} className="p-5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge status={proj.status} size="xs" />
                            <span className="text-[11px] font-semibold text-slate-500">
                              {proj.team?.name || 'Student Team'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                            {proj.title}
                          </h4>
                        </div>
                        <Link to={`/faculty/projects`}>
                          <Button size="sm" variant="ghost" className="text-indigo-600">
                            Review
                          </Button>
                        </Link>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500">
                          <span>Progress</span>
                          <span className="font-bold text-slate-800 font-mono">{proj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No active projects currently mentored. Check your pending mentor requests.
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right 3 cols: Upcoming Meetings & AI Tools */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader
              title="Upcoming Meetings"
              subtitle="Confirmed project meetings"
              action={
                <Link to="/faculty/meetings" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  All Meetings
                </Link>
              }
            />
            <CardBody className="p-0">
              {analytics?.upcomingMeetingList && analytics.upcomingMeetingList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {analytics.upcomingMeetingList.map((m) => (
                    <div key={m._id} className="p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.project?.title || 'Meeting'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Student: <strong>{m.requestedBy?.name}</strong>
                        </p>
                        <span className="text-[10px] text-indigo-600 font-mono flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(m.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                      <Badge status={m.status} size="xs" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No student meetings currently scheduled.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick AI Review Card */}
          <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Prepare Viva Questions</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate relevant questions based on student technologies and project proposals.
              </p>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                className="w-full"
                onClick={() => navigate('/faculty/ai-assistant')}
              >
                Open AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
