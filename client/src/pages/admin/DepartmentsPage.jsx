import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { toast } from 'sonner';
import { Building2, Plus, Edit2 } from 'lucide-react';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/departments');
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

    setSubmitting(true);
    try {
      await api.post('/admin/departments', deptForm);
      toast.success('Department created successfully.');
      setShowModal(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department.');
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
        title="Academic Department Management"
        description="Organize institutional divisions, assign department codes, and manage curriculum groupings."
        actions={
          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            Add Department
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <Card key={dept._id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {dept.code}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Created {new Date(dept.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{dept.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {dept.description || 'Department curriculum and project programs.'}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Academic Department"
        subtitle="Define new college division and unique academic code"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mechanical & Automation Engineering"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Code (e.g. MECH, CSE)
            </label>
            <input
              type="text"
              required
              placeholder="MAE"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Department mission, labs, and research focus..."
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
