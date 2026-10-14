const Recipes = require("../models/recipe");
const { AdminNotification } = require("../models/notification");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { emitAdminNotification } = require("../socket/socketManager");

const uploadDir = path.join(__dirname, "../public/images");

fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, filename);
  },
});

// Multer upload configuration
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  },
});

// Delete only files inside the local images directory
const deleteLocalImage = (imagePath) => {
  if (
    !imagePath ||
    typeof imagePath !== "string" ||
    !imagePath.startsWith("/images/")
  ) {
    return;
  }

  const filename = path.basename(imagePath);
  const fullPath = path.join(uploadDir, filename);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Parse JSON fields sent using FormData
const parseArrayField = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  return JSON.parse(value);
};

// Get all recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find().populate(
      "createdBy",
      "fullName email avatar",
    );

    return res.status(200).json({
      message: "Recipes fetched successfully",
      recipes,
    });
  } catch (error) {
    console.error("Get recipes error:", error);

    return res.status(500).json({
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
};

// Get recipe by MongoDB ID
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate(
      "createdBy",
      "fullName email avatar",
    );

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    return res.status(200).json({
      message: "Recipe fetched successfully",
      recipe,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid recipe ID",
    });
  }
};

// Get image directly by recipe ID
const getRecipeImage = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).select("coverImage");

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    if (!recipe.coverImage || !recipe.coverImage.startsWith("/images/")) {
      return res.status(404).json({
        message: "Recipe image not found",
      });
    }

    const filename = path.basename(recipe.coverImage);
    const imagePath = path.join(uploadDir, filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        message: "Image file not found",
      });
    }

    return res.sendFile(imagePath);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid recipe ID",
    });
  }
};

// Add recipe
const addRecipe = async (req, res) => {
  let createdRecipe;

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

    if (!title || ingredients === undefined || instructions === undefined) {
      return res.status(400).json({
        message: "Title, ingredients and instructions are required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    const parsedIngredients = parseArrayField(ingredients, []);
    const parsedInstructions = parseArrayField(instructions, []);

    if (
      !Array.isArray(parsedIngredients) ||
      !Array.isArray(parsedInstructions)
    ) {
      return res.status(400).json({
        message: "Ingredients and instructions must be arrays",
      });
    }

    createdRecipe = await Recipes.create({
      title,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      cookingTime,
      servings,
      difficulty,
      category,
      description,
      coverImage: req.file ? `/images/${req.file.filename}` : "",
      createdBy: req.user.id,
    });

    // Emit real-time notification to admin (non-blocking)
    try {
      const notification = await AdminNotification.create({
        audience: "admin",
        type: "new_recipe",
        title: "New Recipe Added",
        message: `"${title}" was just submitted.`,
        relatedRecipe: createdRecipe._id,
        relatedUser: req.user.id,
        link: `/admin/recipes`,
      });
      emitAdminNotification(notification);
    } catch (notifErr) {
      console.error("Recipe notification error:", notifErr.message);
    }

    return res.status(201).json({
      message: "Recipe added successfully",
      recipe: createdRecipe,
    });
  } catch (error) {
    // Clean up an uploaded image if recipe creation fails
    if (req.file) {
      deleteLocalImage(`/images/${req.file.filename}`);
    }

    console.error("Add recipe error:", error);

    return res.status(400).json({
      message: "Failed to add recipe",
      error: error.message,
    });
  }
};

// Edit recipe
const editRecipe = async (req, res) => {
  let newImagePath = "";

  try {
    const recipe = await Recipes.findById(req.params.id);

    if (!recipe) {
      if (req.file) {
        deleteLocalImage(`/images/${req.file.filename}`);
      }

      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    if (!req.user || recipe.createdBy.toString() !== req.user.id) {
      if (req.file) {
        deleteLocalImage(`/images/${req.file.filename}`);
      }

      return res.status(403).json({
        message: "Not authorized to edit this recipe",
      });
    }

    const parsedIngredients = parseArrayField(
      req.body.ingredients,
      recipe.ingredients,
    );

    const parsedInstructions = parseArrayField(
      req.body.instructions,
      recipe.instructions,
    );

    if (
      !Array.isArray(parsedIngredients) ||
      !Array.isArray(parsedInstructions)
    ) {
      return res.status(400).json({
        message: "Ingredients and instructions must be arrays",
      });
    }

    let coverImage = recipe.coverImage || "";
    const oldImage = recipe.coverImage;

    if (req.file) {
      newImagePath = `/images/${req.file.filename}`;
      coverImage = newImagePath;
    }

    recipe.title = req.body.title ?? recipe.title;
    recipe.ingredients = parsedIngredients;
    recipe.instructions = parsedInstructions;
    recipe.cookingTime = req.body.cookingTime ?? recipe.cookingTime;
    recipe.servings = req.body.servings ?? recipe.servings;
    recipe.difficulty = req.body.difficulty ?? recipe.difficulty;
    recipe.category = req.body.category ?? recipe.category;
    recipe.description = req.body.description ?? recipe.description;
    recipe.coverImage = coverImage;

    await recipe.save();

    // Remove old image only after successful save
    if (req.file && oldImage && oldImage !== newImagePath) {
      deleteLocalImage(oldImage);
    }

    return res.status(200).json({
      message: "Recipe updated successfully",
      recipe,
    });
  } catch (error) {
    if (req.file) {
      deleteLocalImage(`/images/${req.file.filename}`);
    }

    console.error("Edit recipe error:", error);

    return res.status(400).json({
      message: "Failed to update recipe",
      error: error.message,
    });
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    if (!req.user || recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this recipe",
      });
    }

    const oldImage = recipe.coverImage;

    await Recipes.deleteOne({ _id: recipe._id });

    deleteLocalImage(oldImage);

    return res.status(200).json({
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("Delete recipe error:", error);

    return res.status(500).json({
      message: "Failed to delete recipe",
      error: error.message,
    });
  }
};

module.exports = {
  getRecipes,
  getRecipe,
  getRecipeImage,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
};
