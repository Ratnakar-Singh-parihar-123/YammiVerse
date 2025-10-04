const User = require("../models/user");
const Recipe = require("../models/recipe");

//  Get all favorites of logged-in user
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch favorites", error: error.message });
  }
};

//  Add a recipe to favorites
const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Avoid duplicates
    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    user.favorites.push(recipeId);
    await user.save();

    res.status(201).json({ message: "Recipe added to favorites", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Failed to add favorite", error: error.message });
  }
};

//  Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = user.favorites.filter((fav) => fav.toString() !== recipeId);
    await user.save();

    res.json({ message: "Recipe removed from favorites", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove favorite", error: error.message });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};