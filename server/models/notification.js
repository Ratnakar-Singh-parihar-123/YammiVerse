const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema(
  {
    audience: {
      type: String,
      enum: ["admin"],
      default: "admin",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "new_user",
        "new_recipe",
        "recipe_deleted",
        "recipe_updated",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    relatedRecipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

adminNotificationSchema.index({ audience: 1, isRead: 1, createdAt: -1 });

const AdminNotification = mongoose.model(
  "AdminNotification",
  adminNotificationSchema,
);

/**
 * 2. BroadcastNotification Schema
 * Admin-to-user broadcasts (announcements, important alerts, updates).
 */
const broadcastNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "announcement",
        "important",
        "recipe_update",
        "maintenance",
        "general",
      ],
      default: "general",
    },
    actionLabel: {
      type: String,
      default: "",
      trim: true,
    },
    actionUrl: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const BroadcastNotification = mongoose.model(
  "BroadcastNotification",
  broadcastNotificationSchema,
);

/**
 * 3. UserNotification Schema
 * Per-user read tracking for broadcast notifications.
 */
const userNotificationSchema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BroadcastNotification",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

userNotificationSchema.index({ notification: 1, user: 1 }, { unique: true });
userNotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const UserNotification = mongoose.model(
  "UserNotification",
  userNotificationSchema,
);

module.exports = {
  AdminNotification,
  BroadcastNotification,
  UserNotification,
  Notification: AdminNotification,
};
