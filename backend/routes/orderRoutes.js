import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/farmer-orders", authorizeRoles("farmer", "admin"), getFarmerOrders);
router.get("/admin", authorizeRoles("admin"), getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorizeRoles("farmer", "admin"), updateOrderStatus);
router.patch("/:id/cancel", cancelOrder);

export default router;
