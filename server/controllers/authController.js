const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Otp = require("../models/otp");
const sendEmail = require("../utils/sendEmail");

// 1) Forgot Password → send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove old OTPs for this email
    await Otp.deleteMany({ email });

    // Save OTP in DB (with expiry)
    await Otp.create({
      email,
      otp: hashedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send email
    await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2) Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (record.expiresAt < Date.now()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    // Generate short-lived reset token
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    // OTP once used → delete
    await Otp.deleteMany({ email });

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3) Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset token expired" });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (decoded.email !== email)
      return res.status(400).json({ message: "Invalid token payload" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashed });

    // Cleanup OTPs just in case
    await Otp.deleteMany({ email });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};