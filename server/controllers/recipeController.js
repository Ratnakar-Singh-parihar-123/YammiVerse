// controllers/recipeController.js
const Recipes = require("../models/recipe");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const fs = require("fs");

let cloudEnabled = false;
try {
  cloudEnabled =
    !!process.env.CLOUD_NAME && !!process.env.CLOUD_API_KEY && !!process.env.CLOUD_API_SECRET;

  if (cloudEnabled) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
    console.log("✅ Cloudinary configured");
  } else {
    console.warn("⚠️ Cloudinary credentials missing — using local uploads fallback");
  }
} catch (err) {
  cloudEnabled = false;
  console.warn("⚠️ Cloudinary configuration failed, falling back to local:", err.message || err);
}

// Choose storage: CloudinaryStorage (if enabled) or multer.diskStorage local fallback
let storage;
if (cloudEnabled) {
  try {
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "yammiverse_recipes",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
    });
    console.log("✅ Using CloudinaryStorage for uploads");
  } catch (err) {
    cloudEnabled = false;
    console.error("⚠️ Failed to initialize CloudinaryStorage, falling back to local disk:", err);
  }
}

if (!storage) {
  const uploadDir = path.join(__dirname, "../public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  });
  console.log("✅ Using local disk storage for uploads:", uploadDir);
}

const upload = multer({ storage });

// ===== Controllers =====
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipes.find().populate("createdBy", "fullName email avatar");
    res.json({ success: true, message: "Recipes fetched successfully", recipes });
  } catch (error) {
    console.error("❌ Error fetching recipes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch recipes", error: error.message });
  }
};

const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id).populate("createdBy", "fullName email avatar");
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.json({ success: true, message: "Recipe fetched successfully", recipe });
  } catch (error) {
    console.error("❌ Error fetching recipe:", error);
    res.status(400).json({ success: false, message: "Invalid recipe ID", error: error.message });
  }
};

const addRecipe = async (req, res) => {
  try {
    // Helpful debug logs
    console.log("🟢 New recipe request fields:", Object.keys(req.body));
    console.log("📷 File object present?", !!req.file);

    const { title, ingredients, instructions, cookingTime, servings, difficulty, category, description } =
      req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ success: false, message: "Title, ingredients and instructions are required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

    // parse JSON fields with safe try/catch
    let parsedIngredients, parsedInstructions;
    try {
      parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid ingredients JSON", error: err.message });
    }
    try {
      parsedInstructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid instructions JSON", error: err.message });
    }

    // Determine image URL safely (supports Cloudinary, local disk, or none)
    let imageUrl = "";
    if (req.file) {
      // multer-storage-cloudinary typically sets req.file.path (and sometimes req.file.secure_url)
      imageUrl = req.file.path || req.file.secure_url || req.file.url || "";
      // If local disk storage returns path on disk (absolute or relative), turn into /uploads/filename for client
      if (imageUrl && !imageUrl.startsWith("http")) {
        // If multer diskStorage produced an absolute path, use basename
        imageUrl = `/uploads/${path.basename(req.file.path || imageUrl)}`;
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

    res.status(201).json({ success: true, message: "Recipe added successfully", recipe: newRecipe });
  } catch (error) {
    console.error("❌ Error adding recipe:", error);
    // If this is an error produced by Cloudinary/multer, surface that message
    res.status(500).json({ success: false, message: "Failed to add recipe", error: error.message || String(error) });
  }
};

const editRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    if (req.user && recipe.createdBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

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
      coverImage = req.file.path || req.file.secure_url || req.file.url || coverImage;
      if (coverImage && !coverImage.startsWith("http")) {
        coverImage = `/uploads/${path.basename(req.file.path || coverImage)}`;
      }
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
    res.status(500).json({ success: false, message: "Failed to update recipe", error: error.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    if (req.user && recipe.createdBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Optional: If Cloudinary URL remove it (best-effort)
    if (recipe.coverImage && recipe.coverImage.includes("cloudinary.com")) {
      const parts = recipe.coverImage.split("/");
      const last = parts.pop();
      const publicId = last ? last.split(".")[0] : null;
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`yammiverse_recipes/${publicId}`);
        } catch (err) {
          console.warn("⚠️ Cloudinary delete failed (non-fatal):", err.message || err);
        }
      }
    }

    await Recipes.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting recipe:", error);
    res.status(500).json({ success: false, message: "Failed to delete recipe", error: error.message });
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