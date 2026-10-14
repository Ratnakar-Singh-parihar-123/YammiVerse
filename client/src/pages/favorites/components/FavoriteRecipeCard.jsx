import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import { getImageUrl } from "../../../utils/api";

const FavoriteRecipeCard = ({ recipe, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onToggleFavorite(recipe?._id);
  };

  const imageUrl = getImageUrl(recipe?.coverImage || recipe?.image);

  return (
    <div className="bg-card border border-border rounded-xl shadow-warm hover:shadow-warm-md transition-all duration-300 group overflow-hidden flex flex-col">
      <Link to={`/recipes/${recipe?._id}`} className="block flex-1 flex flex-col">
        <div className="relative overflow-hidden h-48 sm:h-52 bg-muted/30">
          <Image
            src={imageUrl}
            alt={recipe?.title || "Recipe"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* ❤️ Favorite Toggle Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-10 h-10 bg-background/85 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background transition-all shadow-md active:scale-95"
            aria-label="Remove from favorites"
          >
            <Icon
              name="Heart"
              size={20}
              className="text-destructive fill-current"
            />
          </button>

          {/* Difficulty Badge */}
          {recipe?.difficulty && (
            <div className="absolute top-3 left-3 bg-background/85 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-foreground">
              {recipe.difficulty}
            </div>
          )}

          {/* Cooking Time Badge */}
          {recipe?.cookingTime && (
            <div className="absolute bottom-3 left-3 bg-background/85 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center space-x-1.5 shadow-sm">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">
                {recipe.cookingTime}
              </span>
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {recipe?.title}
            </h3>

            {recipe?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {recipe.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{recipe?.servings || 1} servings</span>
            </div>
            {recipe?.category && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {recipe.category}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FavoriteRecipeCard;
