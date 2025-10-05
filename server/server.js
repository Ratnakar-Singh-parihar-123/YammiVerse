const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDb = require("./config/connectionDb");
const fs = require("fs");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect Database
connectDb();

// ✅ Middleware
app.use(express.json());

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000", // CRA
  "http://localhost:5173", // Vite
  "https://yammiverse.onrender.com", // Deployed frontend
];

// ✅ CORS Config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Debug origin (optional)
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// ✅ Ensure upload folders exist (important for Render)
const uploadDirs = ["./public/uploads", "./public/images"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images"))); // 👈 for recipe images
app.use(express.static("public"));

// ✅ API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// -------------------------
// ✅ Serve React frontend (AFTER APIs)
// -------------------------
const frontendPath = path.join(__dirname, "../client/build");
app.use(express.static(frontendPath));

// ✅ FIX: Express v5 doesn’t allow "*" — use "/*"
app.get("/*", (req, res, next) => {
  if (
    !req.path.startsWith("/api") &&
    !req.path.startsWith("/uploads") &&
    !req.path.startsWith("/images")
  ) {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  } else {
    next();
  }
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});