import AuditLog from "../models/AuditLog.js";

export async function recordAudit(req, { action, entityType, entityId, metadata = {} } = {}) {
  if (!req?.user || !action) return null;
  return AuditLog.create({
    action,
    entityType,
    entityId,
    actor: req.user._id,
    actorEmail: req.user.email,
    metadata,
    ipAddress: req.ip,
    userAgent: req.get?.("user-agent") || "",
  });
}
