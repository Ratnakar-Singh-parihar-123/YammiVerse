const express = require("express");
const router = express.Router();

// 🛠️ Import controller functions
const {
  forgotPassword,
  verifyOtp,
  resetPassword,
  adminSetupStatus,
} = require("../controllers/authController");

router.get("/admin-setup-status", adminSetupStatus);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

module.exports = router;
