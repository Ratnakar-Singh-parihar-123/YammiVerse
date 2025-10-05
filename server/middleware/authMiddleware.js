const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 🔐 Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🧱 No token provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing.",
      });
    }

    // 🧩 Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Find the user in DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }

    // 🧠 Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);

    // 🧨 Handle expired or invalid tokens specifically
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Authentication failed.",
      });
    }

    // 🧩 Default fallback
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please try again.",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;