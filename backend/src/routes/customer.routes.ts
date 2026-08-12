import { Router } from "express";
import { prisma } from "../config/prisma.js";
import {
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
Helper function
Express can type req.params.id as string | string[].
Prisma needs a string.
*/
function getParamId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

/*
ADMIN, SALES, WAREHOUSE, ACCOUNTS can view all customers
*/
router.get(
  "/",
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  async (req, res, next) => {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      console.error("Get customers error:", error);
      next(error);
    }
  }
);

/*
ADMIN and SALES only
Create customer
*/
router.post(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  async (req, res, next) => {
    try {
      const {
        customerName,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status,
        followUpDate,
        notes,
      } = req.body || {};

      // Validate required fields
      if (
        !customerName ||
        !mobile ||
        !businessName ||
        !customerType ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message:
            "customerName, mobile, businessName, customerType and address are required",
        });
      }

      // Validate follow-up date if provided
      let parsedFollowUpDate: Date | undefined;

      if (followUpDate) {
        parsedFollowUpDate = new Date(followUpDate);

        if (Number.isNaN(parsedFollowUpDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid followUpDate",
          });
        }
      }

      const customer = await prisma.customer.create({
        data: {
          customerName,
          mobile,
          email: email || null,
          businessName,
          gstNumber: gstNumber || null,
          customerType,
          address,
          status: status || "LEAD",
          followUpDate: parsedFollowUpDate,
          notes: notes || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Create customer error:", error);
      next(error);
    }
  }
);

/*
ADMIN, SALES, WAREHOUSE, ACCOUNTS can view one customer
*/
router.get(
  "/:id",
  authorizeRoles("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  async (req, res, next) => {
    try {
      const customerId = getParamId(req.params.id);

      const customer = await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
        include: {
          followUps: {
            orderBy: {
              followUpDate: "desc",
            },
          },
          challans: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error("Get customer error:", error);
      next(error);
    }
  }
);

/*
ADMIN and SALES only
Create follow-up
*/
router.post(
  "/:id/follow-ups",
  authorizeRoles("ADMIN", "SALES"),
  async (req: AuthRequest, res, next) => {
    try {
      const customerId = getParamId(req.params.id);

      const { note, followUpDate } = req.body || {};

      // Get logged-in user from JWT
      const createdById = req.user?.userId;

      if (!createdById) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Validate fields
      if (!note || !followUpDate) {
        return res.status(400).json({
          success: false,
          message: "note and followUpDate are required",
        });
      }

      // Check customer exists
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

      // Validate date
      const parsedDate = new Date(followUpDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid followUpDate",
        });
      }

      // Create follow-up
      const followUp = await prisma.customerFollowUp.create({
        data: {
          customerId,
          createdById,
          note,
          followUpDate: parsedDate,
        },
        include: {
          customer: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Update customer's next follow-up date
      await prisma.customer.update({
        where: {
          id: customerId,
        },
        data: {
          followUpDate: parsedDate,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Follow-up created successfully",
        data: followUp,
      });
    } catch (error) {
      console.error("Create follow-up error:", error);
      next(error);
    }
  }
);

/*
ADMIN and SALES only
Update customer
*/
router.put(
  "/:id",
  authorizeRoles("ADMIN", "SALES"),
  async (req, res, next) => {
    try {
      const customerId = getParamId(req.params.id);

      const {
        customerName,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status,
        followUpDate,
        notes,
      } = req.body || {};

      // Check customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Validate follow-up date
      let parsedFollowUpDate: Date | undefined;

      if (followUpDate) {
        parsedFollowUpDate = new Date(followUpDate);

        if (Number.isNaN(parsedFollowUpDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid followUpDate",
          });
        }
      }

      const customer = await prisma.customer.update({
        where: {
          id: customerId,
        },
        data: {
          customerName,
          mobile,
          email,
          businessName,
          gstNumber,
          customerType,
          address,
          status,
          followUpDate: parsedFollowUpDate,
          notes,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Update customer error:", error);
      next(error);
    }
  }
);

/*
ADMIN only

We do NOT physically delete the customer.
We change the status to INACTIVE.
*/
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  async (req, res, next) => {
    try {
      const customerId = getParamId(req.params.id);

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

      const updatedCustomer = await prisma.customer.update({
        where: {
          id: customerId,
        },
        data: {
          status: "INACTIVE",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Customer deactivated successfully",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error("Deactivate customer error:", error);
      next(error);
    }
  }
);

export default router;