import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../utils/validation.js";
import { authenticate } from "../middleware/auth.js";
import { changePassword, login, me, updateProfile } from "../controllers/authController.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.post("/login", authLimiter, validateBody({ email: [], password: [] }), asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));
router.patch("/me", authenticate, validateBody({ name: [], phone: [] }), asyncHandler(updateProfile));
router.post("/change-password", authenticate, validateBody({ currentPassword: [], newPassword: [] }), asyncHandler(changePassword));

export default router;
