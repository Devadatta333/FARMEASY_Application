import express from "express";
import { chatWithAI, getAIHealth } from "../controllers/aiController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected AI Chat Route - Requires valid JWT token
router.post(
  "/chat",
  protect,
  authorizeRoles("farmer", "consumer", "user", "admin"),
  chatWithAI
);

// Protected AI Service Health Check Route
router.get(
  "/health",
  protect,
  getAIHealth
);

export default router;
