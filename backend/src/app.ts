import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { authenticateToken } from "./middleware/auth.middleware.js";
import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import productRoutes from "./routes/product.routes.js";
import stockMovementRoutes from "./routes/stock-movement.routes.js";
import challanRoutes from "./routes/challan.routes.js";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

// Security
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Body middleware MUST come before routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// Routes
// Public routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// Protected routes - JWT required
app.use("/api/customers", authenticateToken, customerRoutes);
app.use("/api/categories", authenticateToken, categoryRoutes);
app.use("/api/warehouses", authenticateToken, warehouseRoutes);
app.use("/api/products", authenticateToken, productRoutes);
app.use(
  "/api/stock-movements",
  authenticateToken,
  stockMovementRoutes
);
app.use("/api/challans", authenticateToken, challanRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;