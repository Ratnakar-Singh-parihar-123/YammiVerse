import React from "react";
import FavoriteRecipeCard from "./FavoriteRecipeCard";

const FavoritesGrid = ({ recipes = [], onToggleFavorite }) => {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        You haven’t added any recipes to favorites yet ❤️
      </div>
    );
  }

  return (
    <div
      className="
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        gap-6 animate-fadeIn
      "
    >
      {recipes.map((recipe, index) => (
        <FavoriteRecipeCard
          key={recipe?._id || index}
          recipe={recipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default FavoritesGrid;