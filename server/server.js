// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDb = require("./config/connectionDb");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDb();

// JSON middleware
app.use(express.json({ limit: "10mb" }));

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://yammiverse.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("🚫 Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} | Origin: ${req.headers.origin || "N/A"}`);
  next();
});

// Ensure local upload directories exist (dev fallback)
["./public/uploads", "./public/images"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve static assets
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// Serve frontend SPA safely (no direct wildcard route registration)
const frontendPath = path.join(__dirname, "../client/build");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // SPA fallback for GET requests that are not API or static files
  app.use((req, res, next) => {
    const isApi = req.path.startsWith("/api");
    const isStatic = req.path.startsWith("/uploads") || req.path.startsWith("/images");
    if (req.method === "GET" && !isApi && !isStatic) {
      return res.sendFile(path.resolve(frontendPath, "index.html"));
    }
    next();
  });
} else {
  console.warn("⚠️ React build folder not found — skipping frontend serving.");
}

// Global error handler - prints stack if available
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err && (err.stack || err.message || err));
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err && (err.message || String(err)),
  });
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});