const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Recipe = require("../models/recipe");
const { AdminNotification } = require("../models/notification");

// ── Helper: Generate JWT ─────────────────────────────────────────────────────
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ── 1. Admin Bootstrap ───────────────────────────────────────────────────────
const bootstrapAdmin = async (req, res) => {
  try {
    const { secret, fullName, email, password } = req.body;

    // ── Validate bootstrap secret ──────────────────────────────────────────
    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    // const receivedSecret = req.body.secret;
    // console.log("Admin bootstrap debug:", {
    //   envSecretConfigured: Boolean(expectedSecret),
    //   receivedSecretProvided: Boolean(receivedSecret),
    //   secretMatches: receivedSecret === expectedSecret,
    // });
    if (!expectedSecret) {
      return res.status(503).json({
        success: false,
        message: "Admin bootstrap is not configured on this server",
      });
    }
    if (!secret || secret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: "Invalid bootstrap secret",
      });
    }

    // ── Validate fields ────────────────────────────────────────────────────
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Concurrency-safe "at-most-one admin" check ─────────────────────────
    // Uses findOneAndUpdate so parallel requests cannot both succeed.
    // If an admin already exists this query returns the existing doc and we reject.
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "An admin account already exists. Bootstrap is permanently closed.",
      });
    }

    // Check if the email is already taken
    const existingByEmail = await User.findOne({ email: normalizedEmail });
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Atomic creation: if another request slips through, the unique email
    //    index on User will trigger a duplicate-key error (code 11000). ─────
    const admin = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    const token = generateToken(admin._id, admin.email, admin.role);

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar || null,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Admin account already exists (concurrent request).",
      });
    }
    console.error("bootstrapAdmin error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Bootstrap failed" });
  }
};

// ── 2. Dashboard Stats ───────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalRecipes,
      newUsersLast30,
      newRecipesLast30,
      recentUsers,
      recentRecipes,
      unreadNotifications,
      userGrowth,
      recipeGrowth,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Recipe.countDocuments(),
      User.countDocuments({
        role: { $ne: "admin" },
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Recipe.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName email avatar createdAt role"),
      Recipe.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "fullName email avatar")
        .select("title coverImage category difficulty createdAt createdBy"),
      AdminNotification.countDocuments({ audience: "admin", isRead: false }),
      // Daily user counts for the last 7 days
      User.aggregate([
        {
          $match: { role: { $ne: "admin" }, createdAt: { $gte: sevenDaysAgo } },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Daily recipe counts for the last 7 days
      Recipe.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalRecipes,
        newUsersLast30,
        newRecipesLast30,
        unreadNotifications,
      },
      recentUsers,
      recentRecipes,
      userGrowth,
      recipeGrowth,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

// ── 3. User Management ───────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 15);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const roleFilter = req.query.role || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (roleFilter && ["user", "admin"].includes(roleFilter)) {
      filter.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -__v")
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getUsers error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v")
      .lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const recipeCount = await Recipe.countDocuments({ createdBy: user._id });
    return res.json({ success: true, user: { ...user, recipeCount } });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
};

// ── 4. Recipe Management ─────────────────────────────────────────────────────
const getRecipes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 15);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const category = req.query.category?.trim() || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = { $regex: category, $options: "i" };

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "fullName email avatar")
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      recipes,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("admin getRecipes error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch recipes" });
  }
};

/**
 * DELETE /api/admin/recipes/:id
 * Admin can delete any recipe regardless of owner.
 */
const deleteRecipe = async (req, res) => {
  try {
    const Recipe = require("../models/recipe");
    const path = require("path");
    const fs = require("fs");

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe)
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });

    // Delete image file if local
    if (recipe.coverImage && recipe.coverImage.startsWith("/images/")) {
      const filename = path.basename(recipe.coverImage);
      const fullPath = path.join(__dirname, "../public/images", filename);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await Recipe.deleteOne({ _id: recipe._id });

    return res.json({ success: true, message: "Recipe deleted by admin" });
  } catch (err) {
    console.error("admin deleteRecipe error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete recipe" });
  }
};

// ── 5. Admin Profile ─────────────────────────────────────────────────────────
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password -__v");
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    return res.json({ success: true, user: admin });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

/**
 * PUT /api/admin/profile
 * Explicitly strips role — admin cannot change their own role.
 */
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    // Allowed fields — role is explicitly excluded
    const { fullName, bio, location, website } = req.body;
    if (fullName !== undefined)
      admin.fullName = fullName.trim() || admin.fullName;
    if (bio !== undefined) admin.bio = bio;
    if (location !== undefined) admin.location = location;
    if (website !== undefined) admin.website = website;

    await admin.save();

    return res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
        bio: admin.bio,
        location: admin.location,
        website: admin.website,
      },
    });
  } catch (err) {
    console.error("updateAdminProfile error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

/**
 * PUT /api/admin/profile/password
 * Secure password change — verifies current password first.
 */
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both passwords are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const admin = await User.findById(req.user._id);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("changeAdminPassword error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to change password" });
  }
};

module.exports = {
  bootstrapAdmin,
  getDashboardStats,
  getUsers,
  getUserById,
  getRecipes,
  deleteRecipe,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};
