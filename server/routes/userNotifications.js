const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserNotifications,
  getUserUnreadCount,
  markUserNotifAsRead,
  markAllUserNotifsAsRead,
} = require("../controllers/notificationController");

router.use(authMiddleware);
router.get("/", getUserNotifications);
router.get("/unread-count", getUserUnreadCount);
router.patch("/mark-all-read", markAllUserNotifsAsRead);
router.patch("/:id/read", markUserNotifAsRead);

module.exports = router;
