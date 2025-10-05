import React from "react";
import FavoriteRecipeCard from "./FavoriteRecipeCard";

const FavoritesGrid = ({ recipes = [], onToggleFavorite }) => {
  // 🔹 Empty state
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

  // 🔹 Render Grid
  return (
    <section
      aria-label="Favorite recipes"
      className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        xl:grid-cols-4 
        gap-6 
        animate-fadeIn
        px-2
      "
    >
      {recipes.map((recipe, index) => (
        <FavoriteRecipeCard
          key={recipe?._id || `favorite-${index}`} // ✅ Stable + unique key
          recipe={recipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  );
};

export default React.memo(FavoritesGrid);