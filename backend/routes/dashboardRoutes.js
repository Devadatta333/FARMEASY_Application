import express from "express";
import {
  getFarmerDashboardStats,
  getConsumerDashboardStats,
  getAdminDashboardStats,
} from "../controllers/dashboardController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Farmer Dashboard API Endpoint
router.get("/farmer", protect, authorizeRoles("farmer"), getFarmerDashboardStats);

// Consumer/User Dashboard API Endpoint
router.get(
  "/consumer",
  protect,
  authorizeRoles("consumer", "user"),
  getConsumerDashboardStats
);

// Admin Dashboard API Endpoint
router.get("/admin", protect, authorizeRoles("admin"), getAdminDashboardStats);

export default router;
