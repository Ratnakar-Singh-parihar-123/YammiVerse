const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require("../controllers/favoriteController");

// ✅ Get all favorites of logged-in user
router.get("/", verifyToken, getFavorites);

// ✅ Add a recipe to favorites
router.post("/:recipeId", verifyToken, addFavorite);

// ✅ Remove from favorites
router.delete("/:recipeId", verifyToken, removeFavorite);

module.exports = router;