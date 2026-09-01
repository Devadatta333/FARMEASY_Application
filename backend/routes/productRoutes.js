import express from "express";
import {
  createProduct,
  getFarmerProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStockQuantity,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getAllProducts);

// Farmer Product Management Routes (Must precede /:id)
router.get("/farmer/my-products", protect, authorizeRoles("farmer"), getFarmerProducts);

// Single Product Public Details
router.get("/:id", getProductById);

// Protected Farmer Routes
router.post(
  "/",
  protect,
  authorizeRoles("farmer"),
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorizeRoles("farmer", "admin"),
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, authorizeRoles("farmer", "admin"), deleteProduct);

router.patch(
  "/:id/stock",
  protect,
  authorizeRoles("farmer", "admin"),
  updateStockQuantity
);

export default router;
