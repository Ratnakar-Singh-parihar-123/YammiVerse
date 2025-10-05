import React from "react";
import FavoriteRecipeCard from "./FavoriteRecipeCard";

const FavoritesGrid = ({ recipes = [], onToggleFavorite }) => {
  // 🔹 Empty state UI
  if (!recipes?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-fadeIn">
        <p className="text-lg font-medium mb-2">No favorite recipes yet</p>
        <p className="text-sm">
          ❤️ Save some recipes to see them appear here!
        </p>
      </div>
    );
  }

  // 🔹 Render grid of favorite recipes
  return (
    <div
      className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        xl:grid-cols-4 
        gap-6 
        animate-fadeIn
      "
    >
      {recipes.map((recipe, index) => (
        <FavoriteRecipeCard
          key={recipe?._id || index} // ✅ stable key fallback
          recipe={recipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default React.memo(FavoritesGrid);