import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import { getAnalytics, getDashboardData } from "../services/dashboardService.js";
import { serializeAudit, serializeNotification } from "../utils/serializers.js";
import { notFound } from "../utils/errors.js";
import { ok, pageMeta, parsePaging } from "../utils/http.js";

export async function dashboard(req, res) {
  return ok(res, await getDashboardData());
}

export async function analytics(req, res) {
  return ok(res, await getAnalytics({ from: req.query.from, to: req.query.to }));
}

export async function listNotifications(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 30, 100);
  const filter = {};
  if (req.query.unread === "true") filter.read = false;
  const [total, rows] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);
  return ok(res, rows.map(serializeNotification), pageMeta(total, page, limit));
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) throw notFound("Notification not found");
  return ok(res, serializeNotification(notification));
}

export async function listAudits(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 50, 100);
  const [total, rows] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.find().populate("actor", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);
  return ok(res, rows.map(serializeAudit), pageMeta(total, page, limit));
}
