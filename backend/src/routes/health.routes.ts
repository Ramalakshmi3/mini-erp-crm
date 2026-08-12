import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mini ERP CRM API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;