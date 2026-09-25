import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize, authenticate } from "../middleware/auth.js";
import { ADMIN_ROLES } from "../constants.js";
import { analytics, dashboard, listAudits, listNotifications, markNotificationRead } from "../controllers/insightsController.js";
import { report } from "../controllers/reportController.js";

const router = Router();
router.use(authenticate);
router.get("/dashboard", asyncHandler(dashboard));
router.get("/analytics", asyncHandler(analytics));
router.get("/reports", asyncHandler(report));
router.get("/notifications", asyncHandler(listNotifications));
router.patch("/notifications/:id/read", asyncHandler(markNotificationRead));
router.get("/audit-logs", authorize(...ADMIN_ROLES), asyncHandler(listAudits));

export default router;
