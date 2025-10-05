const Recipes = require("../models/recipe");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yammiverse_recipes",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

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

    const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    const newRecipe = await Recipes.create({
      title,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      cookingTime,
      servings,
      difficulty,
      category,
      description,
      coverImage: req.file ? req.file.path : "", // Cloudinary returns secure URL
      createdBy: req.user.id,
    });

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
        coverImage: req.file ? req.file.path : recipe.coverImage,
      },
      { new: true }
    );

    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
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