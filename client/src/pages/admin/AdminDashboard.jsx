import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FolderGit2,
  CheckCircle2,
  Clock,
  Download,
  BarChart4,
  Building,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/admin');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const handleDownloadCsv = () => {
    window.open('/api/admin/export-csv', '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/4 animate-pulse" />
        <SkeletonLoader count={4} type="stat" />
        <SkeletonLoader count={2} />
      </div>
    );
  }

  const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Academic Administration"
        description="Campus-wide visibility over student cohorts, faculty mentoring allocation, project proposal submissions, and semester completion metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadCsv}
            >
              Export CSV Report
            </Button>
            <Button
              size="sm"
              icon={Users}
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </Button>
          </div>
        }
      />

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Students"
          value={analytics?.totalStudents || 0}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Faculty"
          value={analytics?.totalFaculty || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Projects"
          value={analytics?.totalProjects || 0}
          icon={FolderGit2}
          color="indigo"
        />
        <StatCard
          title="Active Projects"
          value={analytics?.activeProjects || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Completed"
          value={analytics?.completedProjects || 0}
          icon={BarChart4}
          color="emerald"
        />
        <StatCard
          title="Under Review"
          value={analytics?.pendingApprovals || 0}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Charts Section: Projects by Domain & Users by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Domain Chart */}
        <Card>
          <CardHeader
            title="Projects Distributed by Domain"
            subtitle="Categorization across artificial intelligence, cybersecurity, cloud, and IoT"
          />
          <CardBody className="p-6">
            <div className="h-64 w-full">
              {analytics?.projectsByDomain && analytics.projectsByDomain.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.projectsByDomain} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No project domain data recorded yet.
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Users by Department Breakdown */}
        <Card>
          <CardHeader
            title="Academic Cohort by Department"
            subtitle="Student and faculty distribution across academic engineering disciplines"
          />
          <CardBody className="p-6">
            <div className="h-64 w-full flex items-center justify-center">
              {analytics?.usersByDepartment && analytics.usersByDepartment.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.usersByDepartment}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      label={({ name, percent }) => `${name.split(' ')?.[0]} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {analytics.usersByDepartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No department breakdown available.</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Projects Table */}
      <Card>
        <CardHeader
          title="Recent Project Proposals"
          subtitle="Latest capstone projects submitted for institutional review"
          action={
            <Link to="/admin/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All Projects <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Domain</th>
                  <th className="p-4">Team</th>
                  <th className="p-4">Mentor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.recentProjects?.map((proj) => (
                  <tr key={proj._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{proj.title}</td>
                    <td className="p-4 text-slate-600">{proj.domain}</td>
                    <td className="p-4 font-semibold text-slate-700">{proj.team?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{proj.mentor?.name || 'Unassigned'}</td>
                    <td className="p-4"><Badge status={proj.status} size="xs" /></td>
                    <td className="p-4 font-mono font-bold text-indigo-600">{proj.progress || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
