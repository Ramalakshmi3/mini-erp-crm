import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);

// Test authenticated user
router.get("/me", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "Authentication successful",
    user: req.user,
  });
});

// Test ADMIN-only access
router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "ADMIN access granted",
      user: req.user,
    });
  }
);

export default router;