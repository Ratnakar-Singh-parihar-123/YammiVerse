const {
  AdminNotification,
  BroadcastNotification,
  UserNotification,
} = require("../models/notification");
const User = require("../models/user");
const { getIO } = require("../socket/socketManager");

// ============================================================================
// ADMIN NOTIFICATION CRUD
// ============================================================================

const getAdminNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { audience: "admin" };
    if (req.query.unread === "true") {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      AdminNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("relatedUser", "fullName email avatar")
        .populate("relatedRecipe", "title coverImage")
        .lean(),
      AdminNotification.countDocuments(filter),
      AdminNotification.countDocuments({ audience: "admin", isRead: false }),
    ]);

    return res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
      unreadCount,
    });
  } catch (err) {
    console.error("getAdminNotifications error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

const getAdminUnreadCount = async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({
      audience: "admin",
      isRead: false,
    });
    return res.json({ success: true, unreadCount: count });
  } catch (err) {
    console.error("getAdminUnreadCount error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch unread count" });
  }
};

const markAdminAsRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findOneAndUpdate(
      { _id: req.params.id, audience: "admin" },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, notification });
  } catch (err) {
    console.error("markAdminAsRead error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark as read" });
  }
};

const markAllAdminAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany(
      { audience: "admin", isRead: false },
      { isRead: true },
    );
    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error("markAllAdminAsRead error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read" });
  }
};

// ============================================================================
// BROADCAST NOTIFICATIONS
// ============================================================================

const createBroadcast = async (req, res) => {
  try {
    const { title, message, type, actionLabel, actionUrl } = req.body;

    // 1. Validate title, message
    if (!title || !title.trim() || !message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title and message are required" });
    }

    // 2. Ensure req.user.role === 'admin'
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admins can create broadcasts" });
    }

    // 3. Create BroadcastNotification
    const broadcast = await BroadcastNotification.create({
      title: title.trim(),
      message: message.trim(),
      type: type || "general",
      actionLabel: actionLabel?.trim() || "",
      actionUrl: actionUrl?.trim() || "",
      createdBy: req.user._id,
      status: "sent",
      sentAt: new Date(),
    });

    // 4. Find all users with role='user'
    const users = await User.find({ role: "user" }).select("_id").lean();

    // 5. Build UserNotification docs array and insertMany with ordered:false
    if (users.length > 0) {
      const userNotifDocs = users.map((u) => ({
        notification: broadcast._id,
        user: u._id,
        isRead: false,
      }));

      try {
        await UserNotification.insertMany(userNotifDocs, { ordered: false });
      } catch (insertErr) {
        // Ignore duplicate key errors if any occurred
        if (
          insertErr.code !== 11000 &&
          !insertErr.writeErrors?.every((e) => e.code === 11000)
        ) {
          console.error(
            "Error bulk inserting user notifications:",
            insertErr.message,
          );
        }
      }
    }

    // 6. Emit Socket.IO 'notification:new' to each user room
    try {
      const io = getIO();
      if (io) {
        const payload = { ...broadcast.toObject(), isRead: false };
        users.forEach((u) => {
          io.to(`user:${u._id.toString()}`).emit("notification:new", payload);
        });
      }
    } catch (socketErr) {
      console.error("Socket broadcast error:", socketErr.message);
    }

    // 7. Return broadcast
    return res.status(201).json({ success: true, notification: broadcast });
  } catch (err) {
    console.error("createBroadcast error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create broadcast" });
  }
};

const getBroadcasts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [broadcasts, total] = await Promise.all([
      BroadcastNotification.find()
        .sort({ sentAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "fullName email")
        .lean(),
      BroadcastNotification.countDocuments(),
    ]);

    return res.json({
      success: true,
      broadcasts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("getBroadcasts error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch broadcasts" });
  }
};

const getBroadcastById = async (req, res) => {
  try {
    const notification = await BroadcastNotification.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .lean();

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Broadcast notification not found" });
    }

    const [totalRecipients, readCount] = await Promise.all([
      UserNotification.countDocuments({ notification: notification._id }),
      UserNotification.countDocuments({
        notification: notification._id,
        isRead: true,
      }),
    ]);

    return res.json({
      success: true,
      notification,
      stats: {
        total: totalRecipients,
        read: readCount,
        unread: Math.max(0, totalRecipients - readCount),
      },
    });
  } catch (err) {
    console.error("getBroadcastById error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch broadcast details" });
  }
};

const deleteBroadcast = async (req, res) => {
  try {
    const broadcast = await BroadcastNotification.findByIdAndDelete(
      req.params.id,
    );
    if (!broadcast) {
      return res
        .status(404)
        .json({ success: false, message: "Broadcast notification not found" });
    }

    await UserNotification.deleteMany({ notification: req.params.id });

    return res.json({
      success: true,
      message: "Broadcast deleted successfully",
    });
  } catch (err) {
    console.error("deleteBroadcast error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete broadcast" });
  }
};

// ============================================================================
// USER NOTIFICATIONS
// ============================================================================

const getUserNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.unread === "true") {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      UserNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "notification",
          model: "BroadcastNotification",
        })
        .lean(),
      UserNotification.countDocuments(filter),
      UserNotification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("getUserNotifications error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch user notifications" });
  }
};

const getUserUnreadCount = async (req, res) => {
  try {
    const unreadCount = await UserNotification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    return res.json({ success: true, unreadCount });
  } catch (err) {
    console.error("getUserUnreadCount error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch unread count" });
  }
};

const markUserNotifAsRead = async (req, res) => {
  try {
    const userNotification = await UserNotification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!userNotification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, userNotification });
  } catch (err) {
    console.error("markUserNotifAsRead error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read" });
  }
};

const markAllUserNotifsAsRead = async (req, res) => {
  try {
    await UserNotification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );
    return res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    console.error("markAllUserNotifsAsRead error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

const updateBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, actionLabel, actionUrl } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    const allowedTypes = [
      "announcement",
      "important",
      "recipe_update",
      "maintenance",
      "general",
    ];

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type.",
      });
    }

    const broadcast = await BroadcastNotification.findById(id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast notification not found.",
      });
    }

    broadcast.title = title.trim();
    broadcast.message = message.trim();

    if (type) broadcast.type = type;

    broadcast.actionLabel = (actionLabel || "").trim();
    broadcast.actionUrl = (actionUrl || "").trim();

    await broadcast.save();
    await broadcast.populate("createdBy", "fullName");

    return res.status(200).json({
      success: true,
      message: "Broadcast updated successfully.",
      broadcast,
    });
  } catch (error) {
    console.error("updateBroadcast error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update broadcast.",
    });
  }
};

module.exports = {
  // Admin notifications
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminAsRead,
  markAllAdminAsRead,
  updateBroadcast,
  // Broadcast notifications
  createBroadcast,
  getBroadcasts,
  getBroadcastById,
  deleteBroadcast,
  // User notifications
  getUserNotifications,
  getUserUnreadCount,
  markUserNotifAsRead,
  markAllUserNotifsAsRead,
  // Backward compatibility aliases
  getNotifications: getAdminNotifications,
  getUnreadCount: getAdminUnreadCount,
  markAsRead: markAdminAsRead,
  markAllAsRead: markAllAdminAsRead,
};
