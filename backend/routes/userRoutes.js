import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can access this route
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin! Access granted.", user: req.user });
});

// Admin and Farmer can access this route
router.get("/farmer", protect, authorizeRoles("admin", "farmer"), (req, res) => {
  res.json({ message: "Welcome Farmer! Access granted.", user: req.user });
});

// All authenticated roles (consumer, farmer, admin) can access this route
router.get("/consumer", protect, authorizeRoles("admin", "farmer", "consumer"), (req, res) => {
  res.json({ message: "Welcome Consumer! Access granted.", user: req.user });
});

export default router;