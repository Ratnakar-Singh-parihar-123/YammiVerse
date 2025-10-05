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
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Fetch all recipes (public)
router.get("/", getRecipes);

// ✅ Get single recipe by ID (public)
router.get("/:id", getRecipe);

// ✅ Add new recipe (protected)
router.post(
  "/",
  authMiddleware,
  upload.single("image"), // 👈 field name MUST match frontend formData.append("image", file)
  addRecipe
);

// ✅ Edit existing recipe (protected)
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"), // optional image update
  editRecipe
);

// ✅ Delete a recipe (protected)
router.delete("/:id", authMiddleware, deleteRecipe);

module.exports = router;