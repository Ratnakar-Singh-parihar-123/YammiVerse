const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  userLogin,
  userSignUp,
  getUser,
  getCurrentUser,
  updateAvatar,
  getProfile,
  updateProfile,
  getSettings,      
  updateSettings,   
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");


// Multer Config (for avatar)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads")); // ✅ absolute path
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-").toLowerCase()
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed (jpg, jpeg, png, webp)"), false);
    }
  },
});


// User Routes


// Signup
router.post("/signup", userSignUp);

// Login
router.post("/login", userLogin);

// Current user basic info
router.get("/me", authMiddleware, getCurrentUser);

// Profile (fetch + update)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Avatar upload
router.put(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"), 
  updateAvatar
);

// ✅ Account Settings
router.get("/settings", authMiddleware, getSettings);
router.put("/settings", authMiddleware, updateSettings);

// Get any user by ID (for public profile view)
router.get("/:id", authMiddleware, getUser);

// Logout
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Logout failed", error: error.message });
  }
});

module.exports = router;