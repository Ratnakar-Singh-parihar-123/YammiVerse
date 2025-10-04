const User = require("../models/user");
const Recipe = require("../models/recipe");
const Favorite = require("../models/favorite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

// 🔑 Helper: Generate JWT
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================== SIGNUP ==================
const userSignUp = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      settings: {
        emailNotifications: true,
        weeklyDigest: false,
        recommendations: true,
        publicProfile: true,
        showStats: true,
      },
    });
    const token = generateToken(newUser._id, newUser.email);
    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        avatar: newUser.avatar || null,
        bio: newUser.bio || "",
        location: newUser.location || "",
        website: newUser.website || "",
        settings: newUser.settings,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// ================== LOGIN ==================
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.email);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar || null,
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ================== GET USER ==================
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName email createdAt avatar bio location website settings"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User fetched successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID", error: error.message });
  }
};

// ================== GET CURRENT USER ==================
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.user._id).select(
      "fullName email createdAt avatar bio location website settings"
    );
    res.status(200).json({
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching current user" });
  }
};

// ================== GET PROFILE ==================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const totalRecipes = await Recipe.countDocuments({ createdBy: req.user._id });
    const totalFavorites = await Favorite.countDocuments({ user: req.user._id });

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

// ================== UPDATE PROFILE ==================
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;
    user.website = req.body.website || user.website;

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

// ================== UPDATE AVATAR ==================
const updateAvatar = async (req, res) => {
  try {
    console.log("📸 Avatar upload request received");
    console.log("📂 req.file:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Save relative path
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    // ✅ Ensure base URL works on both localhost & Render
    const baseUrl =
      "https://yammiverse.onrender.com" || `${req.protocol}://${req.get("host")}`;

    res.json({
      message: "Avatar updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: `${baseUrl}${user.avatar.replace(/\\/g, "/")}`,
      },
    });
  } catch (error) {
    console.error("❌ Avatar Update Error:", error.message);
    res.status(500).json({ message: "Failed to update avatar" });
  }
};

// ================== GET SETTINGS ==================
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

// ================== UPDATE SETTINGS ==================
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