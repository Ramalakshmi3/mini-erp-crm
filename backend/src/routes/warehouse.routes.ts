import { Router } from "express";
import { prisma } from "../config/prisma.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// GET all warehouses
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  async (req, res, next) => {
    try {
      const warehouses = await prisma.warehouse.findMany({
        orderBy: {
          name: "asc",
        },
      });

      res.json({
        success: true,
        data: warehouses,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;