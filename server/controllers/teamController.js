import Team from '../models/Team.js';
import User from '../models/User.js';
import { createNotification } from '../services/notifications/notificationService.js';
import { logAudit } from '../services/audit/auditService.js';

// Create a new student team
export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required.' });
    }

    // Check if user is already leading a team
    const existingLead = await Team.findOne({ leader: req.user._id });
    if (existingLead) {
      return res.status(400).json({ message: 'You are already the leader of a project team.' });
    }

    // Check if user is already a member of an active team
    const existingMember = await Team.findOne({ 'members.user': req.user._id });
    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of an existing team.' });
    }

    const team = await Team.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      leader: req.user._id,
      members: [{
        user: req.user._id,
        role: 'Team Lead',
        joinedAt: new Date(),
      }],
    });

    await logAudit({
      actor: req.user,
      action: 'TEAM_CREATED',
      resourceType: 'Team',
      resourceId: team._id,
      metadata: { teamName: team.name },
      ip: req.ip,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email department studentId')
      .populate('members.user', 'name email department studentId profileImage');

    res.status(201).json({
      message: 'Team created successfully',
      team: populatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's team
export const getMyTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({
      $or: [
        { leader: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('leader', 'name email department studentId')
      .populate('members.user', 'name email department studentId profileImage expertise')
      .populate('project');

    res.json({ team: team || null });
  } catch (error) {
    next(error);
  }
};

// Get team by ID
export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email department studentId')
      .populate('members.user', 'name email department studentId profileImage expertise')
      .populate('project');

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
};

// Update team details
export const updateTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Only leader or admin can update
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the team leader can update team settings.' });
    }

    if (name) team.name = name.trim();
    if (description !== undefined) team.description = description.trim();

    await team.save();

    res.json({
      message: 'Team updated successfully',
      team,
    });
  } catch (error) {
    next(error);
  }
};

// Send invitation to a student
export const inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Only team leader can invite
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can invite members.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Valid student email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const invitedUser = await User.findOne({ email: cleanEmail });
    if (!invitedUser) {
      return res.status(404).json({ message: 'No registered student found with this email address.' });
    }

    if (invitedUser.role !== 'student') {
      return res.status(400).json({ message: 'Only students can be added to project teams.' });
    }

    // Check if already a member
    const alreadyMember = team.members.some(m => m.user.toString() === invitedUser._id.toString());
    if (alreadyMember) {
      return res.status(400).json({ message: 'Student is already a member of this team.' });
    }

    // Check if already invited
    const alreadyInvited = team.invitations.some(
      inv => inv.email === cleanEmail && inv.status === 'pending'
    );
    if (alreadyInvited) {
      return res.status(400).json({ message: 'An active invitation is already pending for this student.' });
    }

    team.invitations.push({
      email: cleanEmail,
      invitedBy: req.user._id,
      status: 'pending',
      sentAt: new Date(),
    });

    await team.save();

    // Send in-app notification to invited student
    await createNotification({
      recipient: invitedUser._id,
      type: 'team_invite',
      title: 'New Team Invitation',
      message: `${req.user.name} invited you to join team "${team.name}".`,
      resourceType: 'Team',
      resourceId: team._id,
      link: '/student/team',
    });

    res.json({
      message: `Invitation sent to ${cleanEmail}`,
      invitations: team.invitations,
    });
  } catch (error) {
    next(error);
  }
};

// Get invitations for current user
export const getMyInvitations = async (req, res, next) => {
  try {
    const teams = await Team.find({
      'invitations.email': req.user.email.toLowerCase(),
      'invitations.status': 'pending',
    }).populate('leader', 'name email department');

    const invites = teams.map(t => {
      const inv = t.invitations.find(i => i.email === req.user.email.toLowerCase() && i.status === 'pending');
      return {
        teamId: t._id,
        teamName: t.name,
        leader: t.leader,
        description: t.description,
        invitationId: inv?._id,
        sentAt: inv?.sentAt,
      };
    });

    res.json({ invitations: invites });
  } catch (error) {
    next(error);
  }
};

// Accept or reject invitation
export const respondInvitation = async (req, res, next) => {
  try {
    const { accept } = req.body; // boolean
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const invitation = team.invitations.find(
      inv => inv.email === req.user.email.toLowerCase() && inv.status === 'pending'
    );

    if (!invitation) {
      return res.status(404).json({ message: 'No pending invitation found for your account.' });
    }

    if (accept) {
      // Check if user is already in another team
      const existingTeam = await Team.findOne({ 'members.user': req.user._id });
      if (existingTeam) {
        return res.status(400).json({ message: 'You are already a member of another team. Please leave your current team first.' });
      }

      invitation.status = 'accepted';
      team.members.push({
        user: req.user._id,
        role: 'Developer',
        joinedAt: new Date(),
      });

      // Notify team leader
      await createNotification({
        recipient: team.leader,
        type: 'team_invite_accepted',
        title: 'Invitation Accepted',
        message: `${req.user.name} accepted the invitation and joined team "${team.name}".`,
        resourceType: 'Team',
        resourceId: team._id,
        link: '/student/team',
      });
    } else {
      invitation.status = 'rejected';
    }

    await team.save();

    res.json({
      message: accept ? 'You have joined the team!' : 'Invitation declined.',
      team,
    });
  } catch (error) {
    next(error);
  }
};

// Remove member from team
export const removeMember = async (req, res, next) => {
  try {
    const { memberUserId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const isLeader = team.leader.toString() === req.user._id.toString();
    const isSelf = req.user._id.toString() === memberUserId;

    if (!isLeader && !isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to remove this member.' });
    }

    if (memberUserId === team.leader.toString()) {
      return res.status(400).json({ message: 'Team leader cannot be removed from team.' });
    }

    team.members = team.members.filter(m => m.user.toString() !== memberUserId);
    await team.save();

    res.json({
      message: 'Member removed successfully',
      team,
    });
  } catch (error) {
    next(error);
  }
};
