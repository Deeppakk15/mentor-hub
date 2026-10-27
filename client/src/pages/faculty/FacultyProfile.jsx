import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

export const FacultyProfile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [expertise, setExpertise] = useState(user?.expertise?.join(', ') || '');
  const [researchInterests, setResearchInterests] = useState(user?.researchInterests?.join(', ') || '');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch('/users/me', {
        name,
        department,
        employeeId,
        bio,
        expertise: expertise.split(',').map(s => s.trim()).filter(Boolean),
        researchInterests: researchInterests.split(',').map(s => s.trim()).filter(Boolean),
      });
      updateUser(res.data.user);
      toast.success('Faculty profile updated. Expertise tags will reflect in student directory.');
    } catch (err) {
      toast.error('Failed to update faculty profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Faculty Academic Profile"
        description="Manage your research biography, areas of expertise, and mentorship capacity visible to students in the directory."
      />

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 font-bold text-xl flex items-center justify-center overflow-hidden border border-purple-200 shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name?.[0] || 'F'
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Faculty Mentor Account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Title
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
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  Areas of Expertise (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Cybersecurity, Blockchain, Web3, Distributed Systems"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Research Interests (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Zero-Knowledge Proofs, Smart Contract Security"
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Faculty Biography & Publications Overview
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Faculty Profile
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export const FacultySettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Faculty Workspace Preferences"
        description="Notification routing, meeting scheduling buffers, and department defaults."
      />
      <Card>
        <CardBody className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">New Mentorship Request Alerts</h4>
              <p className="text-xs text-slate-500 mt-0.5">Send alerts whenever a student team requests your mentorship.</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Student Deliverable Notifications</h4>
              <p className="text-xs text-slate-500 mt-0.5">Alert when teams upload new milestone evidence or reports.</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
          </div>
          <p className="text-[11px] text-slate-400">MentorHub AI System Version 1.0.0-academic</p>
        </CardBody>
      </Card>
    </div>
  );
};
