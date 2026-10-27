import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import { User, Mail, Building, IdCard, Sparkles, Check } from 'lucide-react';

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || '4th Year (Senior)');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch('/users/me', {
        name,
        bio,
        department,
        studentId,
        academicYear,
      });
      updateUser(res.data.user);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Student Profile"
        description="Manage your institutional student details, academic biography, and departmental affiliations."
      />

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name?.[0] || 'S'
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {user?.role} Account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Biography & Engineering Interests
              </label>
              <textarea
                rows={3}
                placeholder="Share your technical interests, favorite frameworks, or past projects..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export const StudentSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account Preferences"
        description="Configure notification preferences and privacy defaults."
      />
      <Card>
        <CardBody className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">In-App Notifications</h4>
              <p className="text-xs text-slate-500 mt-0.5">Receive alerts when teammates assign tasks or faculty review milestones.</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Meeting Reminders</h4>
              <p className="text-xs text-slate-500 mt-0.5">Send alerts 2 hours prior to scheduled mentor sync meetings.</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
          </div>
          <p className="text-[11px] text-slate-400">MentorHub AI System Version 1.0.0-academic</p>
        </CardBody>
      </Card>
    </div>
  );
};
