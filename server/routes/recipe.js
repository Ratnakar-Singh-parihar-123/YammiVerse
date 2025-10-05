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

// ✅ Get all recipes (Public)
router.get("/", getRecipes);

// ✅ Get single recipe by ID (Public)
router.get("/:id", getRecipe);

// ✅ Add a new recipe (Protected)
router.post(
  "/",
  authMiddleware,
  upload.single("image"), // 👈 Frontend must use formData.append("image", file)
  (req, res, next) => {
    try {
      addRecipe(req, res);
    } catch (err) {
      console.error("❌ Error in Add Recipe Route:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ✅ Edit an existing recipe (Protected)
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"), // optional: image change
  (req, res, next) => {
    try {
      editRecipe(req, res);
    } catch (err) {
      console.error("❌ Error in Edit Recipe Route:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ✅ Delete a recipe (Protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await deleteRecipe(req, res);
  } catch (err) {
    console.error("❌ Error in Delete Recipe Route:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;