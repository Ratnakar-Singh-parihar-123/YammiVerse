const express = require("express");
const router = express.Router();

// 🛠️ Import controller functions
const {
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");

// @route   POST /api/auth/forgot-password
// @desc    Send OTP to user's email
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return reset token
router.post("/verify-otp", verifyOtp);

// @route   POST /api/auth/reset-password
// @desc    Reset password with new one
router.post("/reset-password", resetPassword);

module.exports = router;