import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Send,
  AlertCircle,
} from 'lucide-react';

export const MyTeam = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [myInvitations, setMyInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, invRes] = await Promise.all([
        api.get('/teams/me'),
        api.get('/teams/invitations/my'),
      ]);
      setTeam(teamRes.data.team);
      setMyInvitations(invRes.data.invitations || []);
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/teams', {
        name: teamName,
        description: teamDescription,
      });
      setTeam(res.data.team);
      setShowCreateModal(false);
      setTeamName('');
      setTeamDescription('');
      toast.success('Project team created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !team) return;

    setSubmitting(true);
    try {
      await api.post(`/teams/${team._id}/invitations`, { email: inviteEmail });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondInvitation = async (teamId, accept) => {
    try {
      await api.post(`/teams/${teamId}/invitations/respond`, { accept });
      toast.success(accept ? 'You joined the team!' : 'Invitation declined.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond to invitation.');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      await api.post(`/teams/${team._id}/remove-member`, { memberUserId });
      toast.success('Member removed from team.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  const isLeader = team && String(team.leader?._id || team.leader) === String(user._id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Team"
        description="Manage your team members and invites."
        actions={
          team ? (
            isLeader && (
              <Button icon={UserPlus} size="sm" onClick={() => setShowInviteModal(true)}>
                Invite Member
              </Button>
            )
          ) : (
            <Button icon={Users} size="sm" onClick={() => setShowCreateModal(true)}>
              Create Team
            </Button>
          )
        }
      />

      {/* Pending Invitations Received Banner */}
      {myInvitations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <div className="p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>You Have {myInvitations.length} Pending Team Invitation{myInvitations.length > 1 ? 's' : ''}</span>
            </h3>
            <div className="space-y-3">
              {myInvitations.map((inv) => (
                <div
                  key={inv.teamId}
                  className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{inv.teamName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Invited by: <strong>{inv.leader?.name}</strong> ({inv.leader?.email})
                    </p>
                    {inv.description && (
                      <p className="text-xs text-slate-600 mt-1 italic">"{inv.description}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespondInvitation(inv.teamId, false)}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRespondInvitation(inv.teamId, true)}
                    >
                      Accept & Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Team Details or Empty State */}
      {team ? (
        <div className="space-y-6">
          {/* Team Overview Card */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                      Team
                    </span>
                    <span className="text-xs text-slate-400">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{team.name}</h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                {isLeader && (
                  <Badge status="active">Team Lead</Badge>
                )}
              </div>

              {/* Members List */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Members ({team.members?.length || 1})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members?.map((m) => {
                    const memberUser = m.user;
                    const isMemberLeader = String(team.leader?._id || team.leader) === String(memberUser?._id);

                    return (
                      <div
                        key={memberUser?._id || m._id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center overflow-hidden shrink-0 border border-indigo-100">
                            {memberUser?.profileImage ? (
                              <img src={memberUser.profileImage} alt={memberUser.name} className="w-full h-full object-cover" />
                            ) : (
                              memberUser?.name?.[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900">{memberUser?.name}</h4>
                              {isMemberLeader && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                                  Lead
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{memberUser?.email}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {memberUser?.studentId ? `ID: ${memberUser.studentId}` : memberUser?.department}
                            </p>
                          </div>
                        </div>

                        {isLeader && !isMemberLeader && (
                          <button
                            onClick={() => handleRemoveMember(memberUser?._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove member from team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Invitations Sent */}
              {isLeader && team.invitations && team.invitations.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Sent Invitations
                  </h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 overflow-hidden">
                    {team.invitations.map((inv, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{inv.email}</span>
                          <span className="text-[11px] text-slate-400">
                            Sent on {new Date(inv.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge status={inv.status} size="xs" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="p-10">
            <EmptyState
              icon={Users}
              title="No Team Yet"
              description="Create a team to start working with your classmates, or wait for an invitation."
              actionLabel="Create Team"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        </Card>
      )}

      {/* Modal: Create Team */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Team"
        subtitle="You will be set as the team leader."
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Project Squad"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Briefly describe your team focus..."
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Invite Member */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member"
        subtitle="Enter their registered college email"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="classmate@college.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Demo teammates: <strong>deepak.gupta@college.edu</strong>, <strong>deep.jain@college.edu</strong>, or <strong>deepanshu.vashishtha@college.edu</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting} icon={Send}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
