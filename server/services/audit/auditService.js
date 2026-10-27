import AuditLog from '../../models/AuditLog.js';

export const logAudit = async ({
  actor = null,
  actorName = 'System',
  actorRole = 'system',
  action,
  resourceType,
  resourceId = '',
  metadata = {},
  ip = '',
}) => {
  try {
    await AuditLog.create({
      actor: actor ? actor._id || actor : null,
      actorName: actor?.name || actorName,
      actorRole: actor?.role || actorRole,
      action,
      resourceType,
      resourceId: String(resourceId || ''),
      metadata,
      ip,
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};
