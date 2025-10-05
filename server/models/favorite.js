// routes/favorite.js
const express = require("express");
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

// ------------------------------
// ✅ FAVORITE ROUTES
// ------------------------------

// 🔹 Get all favorites (of logged-in user)
router.get("/", authMiddleware, getFavorites);

// 🔹 Add a recipe to favorites
router.post("/:recipeId", authMiddleware, addFavorite);

// 🔹 Remove a recipe from favorites
router.delete("/:recipeId", authMiddleware, removeFavorite);

// ------------------------------
// ✅ Error safety fallback
// ------------------------------
router.use((err, req, res, next) => {
  console.error("🔥 Favorite Route Error:", err.message);
  res.status(500).json({
    message: "Something went wrong in favorites route!",
    error: err.message,
  });
});

module.exports = router;