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
  "https://yammiverse.onrender.com", // Render frontend
];

// ✅ CORS Setup
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

// ✅ Request Debug Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} | Origin: ${req.headers.origin || "N/A"}`);
  next();
});

// ✅ Ensure local upload dirs exist (safe for dev)
["./public/uploads", "./public/images"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ✅ Serve static assets
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "public")));

// ✅ API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// ✅ SPA Frontend (React/Vite build)
const frontendPath = path.join(__dirname, "../client/build");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // ⚡ Express 5-safe SPA fallback (NO wildcard!)
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

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});