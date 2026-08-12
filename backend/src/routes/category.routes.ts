import { Router } from "express";
import { prisma } from "../config/prisma.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// GET all categories
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  async (req, res, next) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      });

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;