const express = require("express");
const router = express.Router();
const {
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
} = require("../controllers/recipeController");
const verifyToken = require("../middleware/authMiddleware");


// Recipe Routes


// 🔹 Get all recipes
router.get("/", getRecipes);

// 🔹 Get recipe by ID
router.get("/:id", getRecipe);

// 🔹 Add new recipe (image upload supported)
router.post("/", verifyToken, upload.single("image"), addRecipe);

// 🔹 Edit recipe (update + replace image if new uploaded)
router.put("/:id", verifyToken, upload.single("image"), editRecipe);

// 🔹 Delete recipe
router.delete("/:id", verifyToken, deleteRecipe);

module.exports = router;