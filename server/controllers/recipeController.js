const Recipes = require("../models/recipe");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Multer + Cloudinary Setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yammiverse_recipes",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

const upload = multer({ storage });

/* ==========================================================
   📘 CONTROLLERS
========================================================== */

// ✅ Get All Recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find().populate(
      "createdBy",
      "fullName email avatar"
    );
    res.json({
      success: true,
      message: "Recipes fetched successfully",
      recipes,
    });
  } catch (error) {
    console.error("❌ Error fetching recipes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
};

// ✅ Get Single Recipe
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate(
      "createdBy",
      "fullName email avatar"
    );
    if (!recipe)
      return res.status(404).json({ success: false, message: "Recipe not found" });

    res.json({
      success: true,
      message: "Recipe fetched successfully",
      recipe,
    });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(400).json({
      success: false,
      message: "Invalid recipe ID",
      error: error.message,
    });
  }
};

// ✅ Add New Recipe (Cloudinary)
const addRecipe = async (req, res) => {
  try {
    const {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      category,
      description,
    } = req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({
        success: false,
        message: "Title, ingredients, and instructions are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // 🧾 Parse JSON Fields
    const parsedIngredients =
      typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions =
      typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    // 🖼️ Handle Cloudinary image
    const imageUrl = req.file ? req.file.path : "";

    const newRecipe = await Recipes.create({
      title,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      cookingTime,
      servings,
      difficulty,
      category,
      description,
      coverImage: imageUrl,
      createdBy: req.user.id,
    });

    res
      .status(201)
      .json({ success: true, message: "Recipe added successfully", recipe: newRecipe });
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add recipe",
      error: error.message,
    });
  }
};

// ✅ Edit Recipe
const editRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ success: false, message: "Recipe not found" });

    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to edit this recipe" });
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

    // 🖼️ Update image if new uploaded
    let coverImage = recipe.coverImage;
    if (req.file) coverImage = req.file.path;

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

    res.json({
      success: true,
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recipe",
      error: error.message,
    });
  }
};

// ✅ Delete Recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ success: false, message: "Recipe not found" });

    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this recipe" });
    }

    // 🧹 Delete from Cloudinary (optional)
    if (recipe.coverImage && recipe.coverImage.includes("cloudinary.com")) {
      const publicId = recipe.coverImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`yammiverse_recipes/${publicId}`);
    }

    await Recipes.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting recipe:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete recipe",
      error: error.message,
    });
  }
};

// ✅ Export
module.exports = {
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
};