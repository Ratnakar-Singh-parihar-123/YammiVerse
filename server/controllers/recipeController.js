const Recipes = require("../models/recipe");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure upload folder exists (Render-safe)
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-recipe" + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"), false);
    }
  },
});

// ✅ Get All Recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find().populate("createdBy", "fullName email avatar");
    res.json({ message: "Recipes fetched successfully", recipes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes", error: error.message });
  }
};

// ✅ Get Single Recipe
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate("createdBy", "fullName email avatar");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe fetched successfully", recipe });
  } catch (error) {
    res.status(400).json({ message: "Invalid recipe ID", error: error.message });
  }
};

// ✅ Add Recipe
const addRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, cookingTime, servings, difficulty, category, description } = req.body;
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: "Title, ingredients and instructions are required" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    let parsedIngredients = [];
    let parsedInstructions = [];
    try {
      parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    } catch {
      return res.status(400).json({ message: "Invalid ingredients format" });
    }
    try {
      parsedInstructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;
    } catch {
      return res.status(400).json({ message: "Invalid instructions format" });
    }

    const newRecipe = await Recipes.create({
      title,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      cookingTime,
      servings,
      difficulty,
      category,
      description,
      coverImage: req.file ? `/uploads/${req.file.filename}` : "",
      createdBy: req.user.id,
    });

    // ✅ Full URL for frontend
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    newRecipe.coverImage = req.file ? `${baseUrl}/uploads/${req.file.filename}` : "";

    res.status(201).json({ message: "Recipe added successfully", recipe: newRecipe });
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    res.status(500).json({ message: "Failed to add recipe", error: error.message });
  }
};

// ✅ Edit Recipe
const editRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this recipe" });
    }

    const parsedIngredients = req.body.ingredients
      ? typeof req.body.ingredients === "string"
        ? JSON.parse(req.body.ingredients)
        : req.body.ingredients
      : recipe.ingredients;

    const parsedInstructions = req.body.instructions
      ? typeof req.body.instructions === "string"
        ? JSON.parse(req.body.instructions)
        : req.body.instructions
      : recipe.instructions;

    let coverImage = recipe.coverImage;
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    } else if (req.body.coverImage) {
      coverImage = req.body.coverImage;
    }

    const updatedRecipe = await Recipes.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || recipe.title,
        ingredients: parsedIngredients,
        instructions: parsedInstructions,
        cookingTime: req.body.cookingTime || recipe.cookingTime,
        servings: req.body.servings || recipe.servings,
        difficulty: req.body.difficulty || recipe.difficulty,
        category: req.body.category || recipe.category,
        description: req.body.description || recipe.description,
        coverImage,
      },
      { new: true }
    );

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    updatedRecipe.coverImage = updatedRecipe.coverImage
      ? `${baseUrl}${updatedRecipe.coverImage.replace(/\\/g, "/")}`
      : "";

    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: "Failed to update recipe", error: error.message });
  }
};

// ✅ Delete Recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this recipe" });
    }

    // Optionally delete file from uploads folder
    if (recipe.coverImage && fs.existsSync(path.join(__dirname, `../public${recipe.coverImage}`))) {
      fs.unlinkSync(path.join(__dirname, `../public${recipe.coverImage}`));
    }

    await Recipes.deleteOne({ _id: req.params.id });
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipe", error: error.message });
  }
};

module.exports = {
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
};