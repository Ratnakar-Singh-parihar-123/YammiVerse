import React from 'react';
import FavoriteRecipeCard from './FavoriteRecipeCard';

const FavoritesGrid = ({ recipes, onToggleFavorite }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes?.map((recipe, index) => (
        <FavoriteRecipeCard
          key={recipe?._id || index}  //  FIXED: use _id (fallback: index)
          recipe={recipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default FavoritesGrid;