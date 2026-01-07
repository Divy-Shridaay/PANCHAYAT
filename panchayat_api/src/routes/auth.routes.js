import { Router } from "express";
import {
  login,
  forgotPassword,
  resetPassword,
  changePassword
} from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";


const router = Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ✅ NEW ROUTE
router.post("/change-password", auth, changePassword);

export default router;
