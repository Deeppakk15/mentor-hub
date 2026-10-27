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
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  UserCheck,
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    studentId: '',
    employeeId: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/admin/all?search=${searchTerm}&role=${roleFilter}&department=${departmentFilter}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.accountStatus === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to mark ${userObj.name} as ${newStatus}?`)) return;

    try {
      await api.patch(`/users/admin/${userObj._id}/status`, { status: newStatus });
      toast.success(`Account marked as ${newStatus}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) return;

    setSubmitting(true);
    try {
      await api.post('/users/admin/create', userForm);
      toast.success('User account created successfully.');
      setShowCreateModal(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: 'Computer Science & Engineering',
        studentId: '',
        employeeId: '',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional User & Identity Management"
        description="Oversee student credentials, faculty mentors, department affiliations, and account activation privileges."
        actions={
          <Button icon={UserPlus} size="sm" onClick={() => setShowCreateModal(true)}>
            Create User Account
          </Button>
        }
      />

      {/* Search & Filters */}
      <Card>
        <div className="p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by student name, faculty, email, or institutional ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty Mentors</option>
              <option value="admin">Administrators</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full sm:w-60 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics & Communication">ECE</option>
              <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
            </select>

            <Button type="submit" size="sm" className="w-full sm:w-auto shrink-0">
              Filter
            </Button>
          </form>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <CardBody className="p-0">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">ID Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                            {u.profileImage ? (
                              <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name?.[0]
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge status={u.role} size="xs" />
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">{u.department}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-600">
                        {u.studentId || u.employeeId || 'N/A'}
                      </td>
                      <td className="p-4">
                        <Badge status={u.accountStatus} size="xs" />
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={u.accountStatus === 'active' ? 'outline' : 'primary'}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10">
              <EmptyState
                icon={Users}
                title="No Users Matched Search Criteria"
                description="Try clearing your search query or department filters."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal: Create User Account */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Authorized Academic Account"
        subtitle="Administratively provision student, faculty, or staff accounts"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => setUserForm({ ...userForm, role: 'student' })}
              className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                userForm.role === 'student' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserForm({ ...userForm, role: 'faculty' })}
              className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                userForm.role === 'faculty' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-slate-200'
              }`}
            >
              Faculty Mentor
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Nathan Drake"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College Email
            </label>
            <input
              type="email"
              required
              placeholder="nathan@college.edu"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password
            </label>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={userForm.department}
              onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {userForm.role === 'student' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                placeholder="STU-2022-099"
                value={userForm.studentId}
                onChange={(e) => setUserForm({ ...userForm, studentId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="FAC-2099"
                value={userForm.employeeId}
                onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
