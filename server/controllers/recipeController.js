const Recipes = require("../models/recipe");
const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-image" + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"), false);
    }
  },
});

// ✅ Get all recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find().populate("createdBy", "fullName email avatar");
    res.json({ message: "Recipes fetched successfully", recipes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes", error: error.message });
  }
};

// ✅ Get recipe by ID
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate("createdBy", "fullName email avatar");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe fetched successfully", recipe });
  } catch (error) {
    res.status(400).json({ message: "Invalid recipe ID", error: error.message });
  }
};

// ✅ Add new recipe
const addRecipe = async (req, res) => {
  try {
    const {
      title,
      ingredients,
      instructions,
      cookingTime, // ✅ corrected
      servings,
      difficulty,
      category,
      description,
    } = req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: "Title, ingredients and instructions are required" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    const newRecipe = await Recipes.create({
      title,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      cookingTime, // ✅ corrected
      servings,
      difficulty,
      category,
      description,
      coverImage: req.file ? `/images/${req.file.filename}` : "",
      createdBy: req.user.id, // ✅ required
    });

    res.status(201).json({ message: "Recipe added successfully", recipe: newRecipe });
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    res.status(500).json({ message: "Failed to add recipe", error: error.message });
  }
};

// ✅ Edit recipe
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
      coverImage = `/images/${req.file.filename}`;
    } else if (req.body.coverImage) {
      coverImage = req.body.coverImage;
    }

    const updatedRecipe = await Recipes.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || recipe.title,
        ingredients: parsedIngredients,
        instructions: parsedInstructions,
        cookingTime: req.body.cookingTime || recipe.cookingTime, // ✅ corrected
        servings: req.body.servings || recipe.servings,
        difficulty: req.body.difficulty || recipe.difficulty,
        category: req.body.category || recipe.category,
        description: req.body.description || recipe.description,
        coverImage,
      },
      { new: true }
    );

    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: "Failed to update recipe", error: error.message });
  }
};

// ✅ Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this recipe" });
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