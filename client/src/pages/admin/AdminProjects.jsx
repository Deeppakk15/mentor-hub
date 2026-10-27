import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { Download, Search, Filter, FolderGit2, Users } from 'lucide-react';

export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects?search=${searchTerm}&status=${statusFilter}&domain=${domainFilter}`);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, domainFilter]);

  const handleExportCsv = () => {
    window.open('/api/admin/export-csv', '_blank');
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Project Registry"
        description="Comprehensive master list of all college capstone proposals, active projects, assigned mentors, and completion progress."
        actions={
          <Button icon={Download} size="sm" onClick={handleExportCsv}>
            Export CSV Report
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card>
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search projects by title, keywords, or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>

          <Button size="sm" onClick={fetchProjects}>
            Filter
          </Button>
        </div>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardBody className="p-0">
          {projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Project Title & Domain</th>
                    <th className="p-4">Student Team</th>
                    <th className="p-4">Assigned Mentor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Final Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 max-w-sm">
                        <span className="font-bold text-slate-900 block truncate">{proj.title}</span>
                        <span className="text-[11px] text-slate-500">{proj.domain}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {proj.team?.name || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {proj.mentor?.name ? (
                          <div>
                            <span className="font-medium text-slate-800 block">{proj.mentor.name}</span>
                            <span className="text-[10px] text-slate-400">{proj.mentor.department}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge status={proj.status} size="xs" />
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-600">
                        {proj.progress || 0}%
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {proj.finalScore !== null && proj.finalScore !== undefined ? `${proj.finalScore}/100` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10">
              <EmptyState
                icon={FolderGit2}
                title="No Projects Match Filter"
                description="Try resetting your status filter to see all projects."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
