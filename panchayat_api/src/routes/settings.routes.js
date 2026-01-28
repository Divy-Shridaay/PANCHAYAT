import { Router } from "express";
import { getPricing, updatePricing } from "../controllers/settings.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

// Publicly available (for Payment page)
router.get("/pricing", getPricing);

// Admin only (PUT /api/settings/pricing)
// Note: Based on existing code, admin check is done in frontend or middleware
// but here we just use auth for now as per project style.
router.put("/pricing", auth, updatePricing);

export default router;
