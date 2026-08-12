import { Router } from "express";
import { prisma } from "../config/prisma.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// GET all products
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  async (req, res, next) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          name: "asc",
        },
      });

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST create product
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "WAREHOUSE"),
  async (req, res, next) => {
    try {
      const {
        name,
        sku,
        categoryId,
        warehouseId,
        unitPrice,
        currentStock,
        minimumStock,
        imageUrl,
      } = req.body;

      if (
        !name ||
        !sku ||
        !categoryId ||
        !warehouseId ||
        unitPrice === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "name, sku, categoryId, warehouseId and unitPrice are required",
        });
      }

      const product = await prisma.product.create({
        data: {
          name,
          sku,
          categoryId,
          warehouseId,
          unitPrice,
          currentStock: currentStock ?? 0,
          minimumStock: minimumStock ?? 0,
          imageUrl: imageUrl ?? null,
        },
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;