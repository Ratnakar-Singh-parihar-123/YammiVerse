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

// ✅ CORS (sirf apne hi domain + localhost allow karo)
const allowedOrigins = [
  "http://localhost:3000",   // React local
  "http://localhost:5173",   // Vite local
  "https://yammiverse.onrender.com"   // Render pe deployed domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman, curl
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Debug origin (sirf dev ke liye)
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// ✅ Static files (avatars, images)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static("public"));

// ✅ API Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));
app.use("/api/favorites", require("./routes/favorite"));

// ✅ Serve React frontend (ek hi app me deploy case)
const frontendPath = path.join(__dirname, "../client/build"); // CRA ke liye build
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  }
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});