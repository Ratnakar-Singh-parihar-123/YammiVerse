const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // ✅ user who marked favorite
      required: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe", // ✅ recipe which is favorited
      required: true,
    },
  },
  { timestamps: true }
);

// 🔹 Ensure one recipe can be favorited only once per user
favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);