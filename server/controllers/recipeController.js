const Recipes = require("../models/recipe");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const fs = require("fs");

// ✅ Setup Cloudinary only if credentials exist
const cloudEnabled =
  process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET;

if (cloudEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
  console.log("✅ Cloudinary configured successfully");
} else {
  console.warn("⚠️ Cloudinary not configured — using local uploads");
}

// ✅ Multer storage (Cloudinary OR Local)
let storage;

if (cloudEnabled) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "yammiverse_recipes",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });
} else {
  const uploadDir = path.join(__dirname, "../public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  });
}

const upload = multer({ storage });

/* ==========================================================
   📘 CONTROLLERS
========================================================== */

// ✅ Get all recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find().populate("createdBy", "fullName email avatar");
    res.json({ success: true, message: "Recipes fetched successfully", recipes });
  } catch (error) {
    console.error("❌ Error fetching recipes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch recipes" });
  }
};

// ✅ Get single recipe
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate(
      "createdBy",
      "fullName email avatar"
    );
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.json({ success: true, message: "Recipe fetched successfully", recipe });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(400).json({ success: false, message: "Invalid recipe ID" });
  }
};

// ✅ Add new recipe
const addRecipe = async (req, res) => {
  try {
    console.log("🟢 New recipe request:", req.body.title);
    console.log("📷 File info:", req.file);

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
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    // Parse safely
    const parsedIngredients =
      typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions =
      typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    // ✅ Handle image URL
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary OR local
      if (!imageUrl.startsWith("http")) {
        imageUrl = `/uploads/${path.basename(req.file.path)}`;
      }
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
      coverImage: imageUrl,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Recipe added successfully",
      recipe: newRecipe,
    });
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add recipe",
      error: error.message,
    });
  }
};

// ✅ Edit recipe
const editRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
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
      coverImage = req.file.path.startsWith("http")
        ? req.file.path
        : `/uploads/${path.basename(req.file.path)}`;
    }

    const updated = await Recipes.findByIdAndUpdate(
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

    res.json({ success: true, message: "Recipe updated successfully", recipe: updated });
  } catch (error) {
    console.error("❌ Error updating recipe:", error);
    res.status(500).json({ success: false, message: "Failed to update recipe" });
  }
};

// ✅ Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });

    if (req.user && recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Recipes.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting recipe:", error);
    res.status(500).json({ success: false, message: "Failed to delete recipe" });
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