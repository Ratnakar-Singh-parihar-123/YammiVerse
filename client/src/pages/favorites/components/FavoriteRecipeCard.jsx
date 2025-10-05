import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const FavoriteRecipeCard = ({ recipe, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onToggleFavorite(recipe?._id);
  };

  //  Normalize Image URL
  let imageUrl = recipe?.coverImage || recipe?.image;
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrl = `https://yammiverse.onrender.com/${imageUrl.replace(/\\/g, "/")}`;
  }
  if (!imageUrl) {
    imageUrl = "https://via.placeholder.com/400x300?text=No+Image";
  }

  return (
    <div className="bg-card rounded-lg shadow-warm hover:shadow-warm-md transition-state group">
      {/*  FIXED: correct route param */}
      <Link to={`/recipes/${recipe?._id}`} className="block">
        <div className="relative overflow-hidden rounded-t-lg h-48">
          <Image
            src={imageUrl}
            alt={recipe?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-state"
          />

          {/* ❤️ Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-micro"
            aria-label="Remove from favorites"
          >
            <Icon
              name="Heart"
              size={20}
              className="text-destructive fill-current"
            />
          </button>

          {/* ⏱ Cooking Time */}
          {recipe?.cookingTime && (
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {recipe?.cookingTime}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="p-4">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-micro">
            {recipe?.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {recipe?.servings && (
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={14} />
                  <span>{recipe?.servings} servings</span>
                </div>
              )}
              {recipe?.difficulty && (
                <div className="flex items-center space-x-1">
                  <Icon name="ChefHat" size={14} />
                  <span className="capitalize">{recipe?.difficulty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {recipe?.tags && recipe?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe?.tags?.slice(0, 3)?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted text-xs font-medium text-muted-foreground rounded-md"
                >
                  {tag}
                </span>
              ))}
              {recipe?.tags?.length > 3 && (
                <span className="px-2 py-1 bg-muted text-xs font-medium text-muted-foreground rounded-md">
                  +{recipe?.tags?.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default FavoriteRecipeCard;