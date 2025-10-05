const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDb = require("./config/connectionDb");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect Database
connectDb();

// ✅ Middleware
app.use(express.json());

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://yammiverse.onrender.com",
];

// ✅ CORS Config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Debug (optional)
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// ✅ Ensure upload folders exist (important for Render)
["./public/uploads", "./public/images"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ✅ Static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.static("public"));

// ✅ API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// ✅ React frontend serve (safe fallback for Express 5)
const frontendPath = path.join(__dirname, "../client/build");
app.use(express.static(frontendPath));

app.use((req, res, next) => {
  // Serve React only for non-API, non-static routes
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

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});