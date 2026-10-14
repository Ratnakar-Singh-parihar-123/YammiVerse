// controllers/userController.js
const User = require("../models/user");
const Recipe = require("../models/recipe");
const Favorite = require("../models/favorite");
const { AdminNotification } = require("../models/notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { emitAdminNotification } = require("../socket/socketManager");

// 🔑 Helper: Generate JWT — now includes role
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ── Helper: create & emit admin notification (non-blocking) ──
const notifyAdmin = async (type, title, message, extra = {}) => {
  try {
    const notification = await AdminNotification.create({
      audience: "admin",
      type,
      title,
      message,
      ...extra,
    });
    emitAdminNotification(notification);
  } catch (err) {
    // Notification failures must never break the main operation
    console.error("notifyAdmin error:", err.message);
  }
};

// User Signup
const userSignUp = async (req, res) => {
  try {
    const { password, fullName } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    const normalizedName = fullName?.trim();

    if (!email || !password || !normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // role is always "user" — never accept role from client body
    const newUser = await User.create({
      fullName: normalizedName,
      email,
      password: hashedPassword,
      role: "user",
      settings: {
        emailNotifications: true,
        weeklyDigest: false,
        recommendations: true,
        publicProfile: true,
        showStats: true,
      },
    });

    const token = generateToken(newUser._id, newUser.email, newUser.role);

    // Non-blocking admin notification
    notifyAdmin(
      "new_user",
      "New User Registered",
      `${normalizedName} (${email}) just created an account.`,
      { relatedUser: newUser._id, link: `/admin/users/${newUser._id}` }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        avatar: newUser.avatar || null,
        bio: newUser.bio || "",
        location: newUser.location || "",
        website: newUser.website || "",
        settings: newUser.settings,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

// User Login
const userLogin = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Token now includes role — still signed on backend, safe
    const token = generateToken(user._id, user.email, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,        // ← included so frontend can redirect
        avatar: user.avatar || null,
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Get User by ID

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName email createdAt avatar bio location website settings role",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User fetched successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID", error: error.message });
  }
};

// Get Current User (/me)

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user._id).select(
      "fullName email createdAt avatar bio location website settings role",
    );

    res.status(200).json({
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching current user" });
  }
};

// Get Profile (/profile)

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    //  Stats: recipes count & favorites count
    const totalRecipes = await Recipe.countDocuments({
      createdBy: req.user._id,
    });
    const totalFavorites =
      Array.isArray(user.favorites) && user.favorites.length > 0
        ? user.favorites.length
        : await Favorite.countDocuments({ user: req.user._id });

    res.json({
      user: {
        ...user.toObject(),
        totalRecipes,
        totalFavorites,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update Profile (/profile)
// IMPORTANT: role is explicitly excluded from updates
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    //  Update allowed fields — role intentionally excluded
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.location = req.body.location !== undefined ? req.body.location : user.location;
    user.website = req.body.website !== undefined ? req.body.website : user.website;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        settings: updatedUser.settings,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Update Avatar

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("Avatar Update Error:", error.message);
    res.status(500).json({ message: "Failed to update avatar" });
  }
};

// Get Settings (/settings)

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Settings fetched successfully",
      settings: user.settings,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch settings", error: error.message });
  }
};

// Update Settings (/settings)

const updateSettings = async (req, res) => {
  try {
    const {
      emailNotifications,
      weeklyDigest,
      recommendations,
      publicProfile,
      showStats,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.settings.emailNotifications =
      emailNotifications ?? user.settings.emailNotifications;
    user.settings.weeklyDigest = weeklyDigest ?? user.settings.weeklyDigest;
    user.settings.recommendations =
      recommendations ?? user.settings.recommendations;
    user.settings.publicProfile = publicProfile ?? user.settings.publicProfile;
    user.settings.showStats = showStats ?? user.settings.showStats;

    await user.save();

    res.json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update settings", error: error.message });
  }
};

module.exports = {
  userLogin,
  userSignUp,
  getUser,
  getCurrentUser,
  getProfile,
  updateProfile,
  updateAvatar,
  getSettings,
  updateSettings,
};
