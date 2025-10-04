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
router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", verifyToken, upload.single("image"), addRecipe);
router.put("/:id", verifyToken, upload.single("image"), editRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

module.exports = router;