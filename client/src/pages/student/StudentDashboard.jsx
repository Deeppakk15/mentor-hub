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
  Milestone,
  CheckSquare,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  FileText,
  Users,
  ChevronRight,
  Plus,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/analytics/student');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load student analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
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

  const project = analytics?.project;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')?.[0] || 'Student'} 👋`}
        description="Overview of your project progress, milestone deadlines, and mentor updates."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Sparkles}
              onClick={() => navigate('/student/ai-assistant')}
            >
              AI Assistant
            </Button>
            {!analytics?.hasTeam ? (
              <Button
                size="sm"
                icon={Users}
                onClick={() => navigate('/student/team')}
              >
                Create Team
              </Button>
            ) : !project ? (
              <Button
                size="sm"
                icon={Plus}
                onClick={() => navigate('/student/projects')}
              >
                Create Proposal
              </Button>
            ) : (
              <Button
                size="sm"
                icon={Calendar}
                variant="secondary"
                onClick={() => navigate('/student/meetings')}
              >
                Sync Meeting
              </Button>
            )}
          </div>
        }
      />

      {/* 4 Open Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={analytics?.activeProjects || 0}
          subtitle={project ? project.title.slice(0, 24) + '...' : 'No project yet'}
          icon={FolderKanban}
          color="indigo"
        />
        <StatCard
          title="Mentor Requests"
          value={analytics?.pendingMentorRequests || 0}
          subtitle={analytics?.pendingMentorRequests > 0 ? 'Pending review' : 'No pending requests'}
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="Completed Milestones"
          value={analytics?.completedMilestones || 0}
          subtitle="Approved"
          icon={Milestone}
          color="emerald"
        />
        <StatCard
          title="Pending Tasks"
          value={analytics?.pendingTasks || 0}
          subtitle="In progress"
          icon={CheckSquare}
          color="amber"
        />
      </div>

      {/* Current Project Card & Progress Indicator */}
      {project ? (
        <Card>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge status={project.status} size="sm" />
                  <span className="text-xs text-slate-400 font-mono">v{project.submissionVersion}.0</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {project.domain}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{project.title}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl line-clamp-2">{project.abstract}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/student/projects/${project._id}`}>
                  <Button size="sm" variant="outline">
                    View Proposal
                  </Button>
                </Link>
                <Link to="/student/tasks">
                  <Button size="sm">
                    View Tasks
                  </Button>
                </Link>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700">Project Progress</span>
                <span className="font-bold text-indigo-600 font-mono">{project.progress}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Meta Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Mentor:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {project.mentor?.name ? `${project.mentor.name} (${project.mentor.department})` : 'Not assigned yet'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Team:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {project.team?.name || 'My Project Team'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Technologies:</span>
                <div className="flex gap-1 flex-wrap mt-0.5">
                  {project.technologies?.slice(0, 4).map((tech, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-8 text-center">
            <EmptyState
              icon={FolderKanban}
              title={!analytics?.hasTeam ? 'No Team Yet' : 'No Project Yet'}
              description={
                !analytics?.hasTeam
                  ? 'Create a project team or accept pending invitations to get started.'
                  : 'Your team is ready! Draft and submit your project proposal to begin.'
              }
              actionLabel={!analytics?.hasTeam ? 'Create Team' : 'Create Proposal'}
              onAction={() => navigate(!analytics?.hasTeam ? '/student/team' : '/student/projects')}
            />
          </div>
        </Card>
      )}

      {/* Two-Column Asymmetric Layout: Upcoming Deadlines & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Left 4 cols: Recent Tasks */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader
              title="Recent Tasks"
              subtitle="Current tasks assigned to your team"
              action={
                <Link to="/student/tasks" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardBody className="p-0">
              {analytics?.recentTasks && analytics.recentTasks.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {analytics.recentTasks.map((task) => (
                    <div key={task._id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge status={task.status} size="xs" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{task.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Assignee: <span className="font-medium text-slate-700">{task.assignee?.name || 'Unassigned'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={task.priority} size="xs" />
                        {task.dueDate && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No tasks created yet.
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right 3 cols: Upcoming Deadlines & Quick Shortcuts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader
              title="Upcoming Milestones"
              subtitle="Scheduled project deadlines"
              action={
                <Link to="/student/milestones" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  View All
                </Link>
              }
            />
            <CardBody className="p-0">
              {analytics?.upcomingDeadlines && analytics.upcomingDeadlines.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {analytics.upcomingDeadlines.map((dl, idx) => (
                    <div key={idx} className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{dl.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Due: <span className="font-medium text-slate-800">{new Date(dl.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <Badge status={dl.status} size="xs" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No pending milestone deadlines.
                </div>
              )}
            </CardBody>
          </Card>

          {/* AI Helper Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">AI Assistant</span>
              </div>
              <h4 className="text-base font-bold text-white">Need help with your project?</h4>
              <p className="text-xs text-indigo-100 mt-1.5 leading-relaxed">
                Brainstorm project ideas, polish proposal text, or practice review questions.
              </p>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-indigo-700 font-bold"
                onClick={() => navigate('/student/ai-assistant')}
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
