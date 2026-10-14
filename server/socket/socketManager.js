const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

let io = null;

const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // JWT auth middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "_id fullName email role"
      );
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const { user } = socket;
    console.log(`Socket connected: ${user.email} [${user.role}] (${socket.id})`);

    // Every authenticated user joins their private room
    const userRoom = `user:${user._id.toString()}`;
    socket.join(userRoom);

    // Admins also join admin-room
    if (user.role === "admin") {
      socket.join("admin-room");
      console.log(`Admin ${user.email} joined admin-room`);
    }

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${user.email} — ${reason}`);
    });
  });

  return io;
};

const emitAdminNotification = (notification) => {
  if (!io) return;
  io.to("admin-room").emit("admin:notification", notification);
};

const emitUserNotification = (userId, notification) => {
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit("notification:new", notification);
};

const emitBroadcastNotification = (notification) => {
  if (!io) return;
  // Emit to all connected users except admin-room
  // We emit to the notification object itself which createBroadcast will handle per-user
  io.emit("notification:broadcast", notification);
};

const getIO = () => io;

module.exports = {
  initSocket,
  emitAdminNotification,
  emitUserNotification,
  emitBroadcastNotification,
  getIO,
};
