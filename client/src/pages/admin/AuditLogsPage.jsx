import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';
import { ShieldAlert, Search, Clock, FileText } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/audit-logs?action=${filterAction}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Security & Audit Logs"
        description="Immutable chronological audit trail recording logins, mentor request determinations, proposal approvals, and administrative actions."
      />

      {/* Filter Bar */}
      <Card>
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter by action name (e.g. USER_LOGIN, PROPOSAL_APPROVED)..."
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <Button size="sm" onClick={fetchLogs}>
            Filter Logs
          </Button>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Metadata Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-sans font-bold text-slate-800">
                      {log.actorName} <span className="text-[10px] text-slate-400 font-mono">({log.actorRole})</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-sans">
                      {log.resourceType}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate font-mono text-[10px]">
                      {JSON.stringify(log.metadata || {})}
                    </td>
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
