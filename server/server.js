const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDb = require("./config/connectionDb");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect Database
connectDb();

// ✅ Middlewares
app.use(express.json());

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",       // CRA
  "http://localhost:5173",       // Vite
  process.env.FRONTEND_URL || "https://yammiverse.vercel.app", // ✅ frontend env
];

// ✅ CORS Config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman, curl etc.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Debug origin (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("➡️ Request Origin:", req.headers.origin);
    next();
  });
}

// ✅ Static uploads (avatar / recipe images)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.static("public"));

// ✅ API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// -------------------------
// ✅ React / Vite frontend serve (production build)
// -------------------------
const frontendPath = path.join(__dirname, "../client/dist"); // ⚡ change to "build" if CRA
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(frontendPath, "index.html"));
    }
  });
}

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});