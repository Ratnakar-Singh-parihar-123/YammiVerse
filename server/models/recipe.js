const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
    },
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String, required: true },
        unit: { type: String, default: "" },
      },
    ],
    instructions: [
      {
        step: { type: Number, required: true },
        text: { type: String, required: true },
      },
    ],
    cookingTime: {   // ✅ yehi naam consistent rahega
      type: String,
      default: "",
    },
    servings: {
      type: Number,
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);