const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  bootstrapAdmin,
  getDashboardStats,
  getUsers,
  getUserById,
  getRecipes,
  deleteRecipe,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/adminController");

// ── Multer for admin avatar upload ──
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/uploads")),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-").toLowerCase(),
    ),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) cb(null, true);
    else cb(new Error("Only images are allowed (jpg, jpeg, png, webp)"), false);
  },
});

// ─────────────────────────────────────────────
// PUBLIC — Bootstrap (secret required)
// ─────────────────────────────────────────────

router.post("/bootstrap", bootstrapAdmin);

// ─────────────────────────────────────────────
// PROTECTED — All routes below require valid JWT + admin role
// ─────────────────────────────────────────────
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);

// Recipe management
router.get("/recipes", getRecipes);
router.delete("/recipes/:id", deleteRecipe);

// Admin profile
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.put("/profile/avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    const User = require("../models/user");
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    return res.json({
      success: true,
      message: "Avatar updated",
      avatar: user.avatar,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to update avatar" });
  }
});
router.put("/profile/password", changeAdminPassword);

module.exports = router;
