const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminAsRead,
  markAllAdminAsRead,
  createBroadcast,
  getBroadcasts,
  getBroadcastById,
  updateBroadcast,
  deleteBroadcast,
} = require("../controllers/notificationController");

// All routes require an authenticated admin
router.use(authMiddleware, adminMiddleware);

// Admin inbox
router.get("/", getAdminNotifications);
router.get("/unread-count", getAdminUnreadCount);
router.patch("/mark-all-read", markAllAdminAsRead);
router.patch("/:id/read", markAdminAsRead);

// Broadcast management
router.post("/broadcast", createBroadcast);
router.get("/broadcasts", getBroadcasts);
router.get("/broadcasts/:id", getBroadcastById);
router.patch("/broadcasts/:id", updateBroadcast);
router.delete("/broadcasts/:id", deleteBroadcast);

module.exports = router;
