import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import api from '../../services/api';
import { UserCheck, GraduationCap, Briefcase, Clock, Award } from 'lucide-react';

export const FacultyWorkloadPage = () => {
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/workload');
        setWorkload(res.data.facultyWorkload || []);
      } catch (err) {
        console.error('Failed to load faculty workload:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkload();
  }, []);

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Mentorship Allocation & Workload"
        description="Monitor distribution of capstone supervision load across academic faculty to ensure balanced mentorship coverage."
      />

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Active Projects</th>
                  <th className="p-4 text-center">Awaiting Review</th>
                  <th className="p-4 text-center">Pending Requests</th>
                  <th className="p-4 text-center">Completed</th>
                  <th className="p-4 text-right">Total Mentorship Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workload.map((fac) => (
                  <tr key={fac.facultyId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{fac.name}</span>
                        <span className="text-[11px] text-slate-500">{fac.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{fac.department}</td>
                    <td className="p-4 text-center font-mono font-bold text-indigo-600">
                      {fac.activeProjects}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-amber-600">
                      {fac.awaitingReview}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-purple-600">
                      {fac.pendingRequests}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600">
                      {fac.completedProjects}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        fac.totalLoad >= 5
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : fac.totalLoad >= 3
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {fac.totalLoad} Active Teams
                      </span>
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
