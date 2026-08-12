import { Router } from "express";
import { prisma } from "../config/prisma.js";

const router = Router();

/*
CREATE CHALLAN
POST /api/challans
*/
router.post("/", async (req, res) => {
  try {
    const {
      challanNumber,
      customerId,
      createdById,
      items,
    } = req.body;

    // Basic validation
    if (
      !customerId ||
      !createdById ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "customerId, createdById and items are required",
      });
    }

    // Check customer
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check user
    const user = await prisma.user.findUnique({
      where: {
        id: createdById,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all products
    const productIds = items.map(
      (item: any) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products not found",
      });
    }

    // Generate challan number if not provided
    const number =
      challanNumber || `CH-${Date.now()}`;

    // Calculate totals
    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItems = items.map((item: any) => {
      const product = products.find(
        (p) => p.id === item.productId
      );

      const quantity = Number(item.quantity);

      if (!product || quantity <= 0) {
        throw new Error(
          "Invalid product or quantity"
        );
      }

      const unitPrice = Number(product.unitPrice);
      const lineTotal = unitPrice * quantity;

      totalQuantity += quantity;
      totalAmount += lineTotal;

      return {
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity,
        lineTotal,
      };
    });

    // Create challan and items
    const challan = await prisma.challan.create({
      data: {
        challanNumber: number,
        customerId,
        createdById,
        totalQuantity,
        totalAmount,
        status: "DRAFT",

        items: {
          create: challanItems,
        },
      },

      include: {
        customer: true,
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: challan,
    });
  } catch (error: any) {
    console.error(
      "Challan creation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error",
    });
  }
});

/*
GET ALL CHALLANS
GET /api/challans
*/
router.get("/", async (req, res) => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: challans,
    });
  } catch (error: any) {
    console.error(
      "Get challans error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/*
GET SINGLE CHALLAN
GET /api/challans/:id
*/
router.get("/:id", async (req, res) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error: any) {
    console.error(
      "Get challan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/*
CONFIRM CHALLAN
POST /api/challans/:id/confirm
*/
router.post("/:id/confirm", async (req, res) => {
  try {
    const challanId = req.params.id;

    const challan = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },
      include: {
        items: true,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message:
          "Only DRAFT challans can be confirmed",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Check stock for every item
        for (const item of challan.items) {
          const product =
            await tx.product.findUnique({
              where: {
                id: item.productId,
              },
            });

          if (!product) {
            throw new Error(
              `Product not found: ${item.productId}`
            );
          }

          if (
            product.currentStock <
            item.quantity
          ) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`
            );
          }
        }

        // Reduce stock and create OUT movements
        for (const item of challan.items) {
          const product =
            await tx.product.findUnique({
              where: {
                id: item.productId,
              },
            });

          if (!product) {
            throw new Error(
              `Product not found: ${item.productId}`
            );
          }

          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId:
                product.warehouseId,
              quantity: item.quantity,
              type: "OUT",
              reason: `Challan ${challan.challanNumber}`,
              createdById:
                challan.createdById,
              referenceId: challan.id,
            },
          });
        }

        // Confirm challan
        const confirmedChallan =
          await tx.challan.update({
            where: {
              id: challan.id,
            },
            data: {
              status: "CONFIRMED",
              confirmedAt: new Date(),
            },
            include: {
              customer: true,
              items: true,
            },
          });

        return confirmedChallan;
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Challan confirmed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Confirm challan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error",
    });
  }
});

export default router;