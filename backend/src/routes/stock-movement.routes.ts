import { Router } from "express";
import { prisma } from "../config/prisma.js";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// GET all stock movements
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "WAREHOUSE"),
  async (req, res, next) => {
    try {
      const movements = await prisma.stockMovement.findMany({
        include: {
          product: true,
          warehouse: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({
        success: true,
        data: movements,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST stock movement
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "WAREHOUSE"),
  async (req: AuthRequest, res, next) => {
    try {
      const {
        productId,
        warehouseId,
        quantity,
        type,
        reason,
        referenceId,
      } = req.body;

      // Get logged-in user from JWT
      const createdById = req.user?.userId;

      if (
        !productId ||
        !warehouseId ||
        !quantity ||
        !type ||
        !reason
      ) {
        return res.status(400).json({
          success: false,
          message:
            "productId, warehouseId, quantity, type and reason are required",
        });
      }

      if (!createdById) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      if (type !== "IN" && type !== "OUT") {
        return res.status(400).json({
          success: false,
          message: "Type must be IN or OUT",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (type === "OUT" && product.currentStock < quantity) {
          throw new Error("Insufficient stock");
        }

        const newStock =
          type === "IN"
            ? product.currentStock + quantity
            : product.currentStock - quantity;

        const movement = await tx.stockMovement.create({
          data: {
            productId,
            warehouseId,
            quantity,
            type,
            reason,
            createdById,
            referenceId: referenceId || null,
          },
        });

        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            currentStock: newStock,
          },
        });

        return {
          movement,
          newStock,
        };
      });

      res.status(201).json({
        success: true,
        message: "Stock movement created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;