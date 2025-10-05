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

// ============================
// 🥗 PUBLIC ROUTES
// ============================
router.get("/", getRecipes);
router.get("/:id", getRecipe);

// ============================
// 🍳 PROTECTED ROUTES (Auth Required)
// ============================
router.post("/", verifyToken, upload.single("image"), addRecipe);
router.put("/:id", verifyToken, upload.single("image"), editRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

// ✅ Error handling for unmatched routes in /api/recipes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Recipe route not found",
  });
});

module.exports = router;