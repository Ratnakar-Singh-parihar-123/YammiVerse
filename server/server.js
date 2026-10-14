const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

const connectDb = require("./config/connectionDb");
const { initSocket } = require("./socket/socketManager");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// Connect MongoDB
// ========================================
connectDb();

// ========================================
// Allowed Frontend Origins
// ========================================
const allowedOrigins = [
  // Production frontend - Vercel
  "https://yammi-verse-navy.vercel.app",

  // Local development
  "http://localhost:3000",
  "http://localhost:4028",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:8000",

  // Backend origin (if needed)
  "https://yammiverse.onrender.com",
];

// ========================================
// CORS Configuration
// Must be registered before API routes
// ========================================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin, such as certain server-side calls
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("Blocked by CORS:", origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 204,
};

// Apply CORS globally, including preflight requests
app.use(cors(corsOptions));

// ========================================
// Body Parsers
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Request Logger
// ========================================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ========================================
// Local Recipe Images
// ========================================
const imagesDirectory = path.join(__dirname, "public", "images");

app.use("/images", express.static(imagesDirectory));

// ========================================
// Other Public Assets
// ========================================
app.use(express.static(path.join(__dirname, "public")));

// ========================================
// API Routes
// ========================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/user-notifications", require("./routes/userNotifications"));

// ========================================
// Frontend Build (if available)
// ========================================
const frontendPath = path.join(__dirname, "../client/build");

app.use(express.static(frontendPath));

// ========================================
// Frontend Fallback
// ========================================
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api") &&
    !req.path.startsWith("/images")
  ) {
    return res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  }

  next();
});

// ========================================
// 404 Handler for Unmatched API Routes
// ========================================
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ========================================
// Global Error Handler
// ========================================
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  // Multer upload errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Invalid image type
  if (err.message === "Only JPG, JPEG, PNG and WEBP images are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // CORS errors
  if (err.message.startsWith("Not allowed by CORS")) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// ========================================
// Create HTTP Server & Attach Socket.IO
// ========================================
const httpServer = http.createServer(app);

initSocket(httpServer, allowedOrigins);

// ========================================
// Start Server
// ========================================
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed frontend origins:");

  allowedOrigins.forEach((origin) => {
    console.log(`- ${origin}`);
  });
});
