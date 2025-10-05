// =============================
// 🌟 Yammiverse Server (Express 5 Compatible)
// =============================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDb = require("./config/connectionDb");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect MongoDB
connectDb();

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://yammiverse.onrender.com",
];

// ✅ CORS Setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server calls
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("🚫 Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Debug Request Origins (for development)
app.use((req, res, next) => {
  console.log(
    `[${req.method}] ${req.path} | Origin: ${req.headers.origin || "N/A"}`
  );
  next();
});

// ✅ Ensure upload folders exist (Render resets /public sometimes)
["./public/uploads", "./public/images"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ✅ Static File Serving (images + uploads)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public"))); // serve /public assets

// ✅ API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// ✅ Serve React Frontend (SPA-safe for Express v5)
const frontendPath = path.join(__dirname, "../client/build");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // ⚡ Express 5-safe fallback route (no `/*` usage)
  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api") &&
      !req.path.startsWith("/uploads") &&
      !req.path.startsWith("/images")
    ) {
      return res.sendFile(path.resolve(frontendPath, "index.html"));
    }
    next();
  });
} else {
  console.warn("⚠️ React build folder not found, skipping static serve.");
}

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
    error: err.message,
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  console.log(`🚀 Server running on ${baseUrl}`);
});