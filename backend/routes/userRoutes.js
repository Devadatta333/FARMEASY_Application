import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  updateUserProfile,
  changeUserPassword,
  updateUserPreferences,
  deleteUserAccount,
} from "../controllers/userController.js";

const router = express.Router();

// User Profile & Settings routes
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);
router.put("/change-password", protect, changeUserPassword);
router.put("/preferences", protect, updateUserPreferences);
router.delete("/account", protect, deleteUserAccount);

// Legacy role verification routes
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin! Access granted.", user: req.user });
});

router.get("/farmer", protect, authorizeRoles("admin", "farmer"), (req, res) => {
  res.json({ message: "Welcome Farmer! Access granted.", user: req.user });
});

router.get("/consumer", protect, authorizeRoles("admin", "farmer", "consumer"), (req, res) => {
  res.json({ message: "Welcome Consumer! Access granted.", user: req.user });
});

export default router;