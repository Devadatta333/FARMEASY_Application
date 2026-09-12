import User from "../models/User.js";
import { uploadProductImage } from "../config/cloudinary.js";

// @desc    Update user profile details & avatar
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, location } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();

    // Handle avatar image file upload if uploaded
    if (req.file) {
      const uploadedImg = await uploadProductImage(req.file.buffer, req.file.originalname);
      user.avatar = uploadedImg.url;
    } else if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully! 🌱",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password securely
// @route   PUT /api/users/change-password
// @access  Private
export const changeUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google-only users without a set password can set their initial password directly
    if (user.password) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully! 🔐",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences (theme, notification settings)
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = async (req, res, next) => {
  try {
    const { theme, emailNotifications, orderNotifications, promotionalEmails } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.preferences = {
      theme: theme || user.preferences?.theme || "light",
      emailNotifications:
        emailNotifications !== undefined
          ? emailNotifications
          : user.preferences?.emailNotifications ?? true,
      orderNotifications:
        orderNotifications !== undefined
          ? orderNotifications
          : user.preferences?.orderNotifications ?? true,
      promotionalEmails:
        promotionalEmails !== undefined
          ? promotionalEmails
          : user.preferences?.promotionalEmails ?? false,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully! ⚙️",
      preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteUserAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password && password) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password. Cannot delete account." });
      }
    }

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
