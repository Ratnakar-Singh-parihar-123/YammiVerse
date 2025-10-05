const Favorite = require("../models/favorite");
const Recipe = require("../models/recipe");

// ✅ Get all favorites for the logged-in user
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: "recipe",
        populate: { path: "createdBy", select: "fullName avatar email" },
      })
      .sort({ createdAt: -1 });

    // Base URL for images
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    // Format response
    const formattedFavorites = favorites.map((fav) => {
      const recipe = fav.recipe;
      return {
        _id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        createdBy: recipe.createdBy,
        createdAt: recipe.createdAt,
        coverImage: recipe.coverImage
          ? `${baseUrl}${recipe.coverImage.replace(/\\/g, "/")}`
          : null,
      };
    });

    res.status(200).json({
      message: "Favorites fetched successfully",
      favorites: formattedFavorites,
    });
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    res.status(500).json({
      message: "Failed to fetch favorites",
      error: error.message,
    });
  }
};

// ✅ Add a recipe to favorites
const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: req.user.id,
      recipe: recipeId,
    });

    if (existing) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    await Favorite.create({ user: req.user.id, recipe: recipeId });
    res.status(201).json({ message: "Recipe added to favorites" });
  } catch (error) {
    console.error("❌ Error adding favorite:", error);
    res.status(500).json({
      message: "Failed to add favorite",
      error: error.message,
    });
  }
};

// ✅ Remove a recipe from favorites
const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      recipe: recipeId,
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Recipe removed from favorites" });
  } catch (error) {
    console.error("❌ Error removing favorite:", error);
    res.status(500).json({
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};