import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const FavoriteRecipeCard = ({ recipe, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onToggleFavorite(recipe?._id);
  };

  // ✅ Normalize Image URL (Render safe)
  let imageUrl = recipe?.coverImage || recipe?.image;
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrl = `https://yammiverse.onrender.com/${imageUrl.replace(/\\/g, "/")}`;
  }
  if (!imageUrl) {
    imageUrl = "https://via.placeholder.com/400x300?text=No+Image";
  }

  return (
    <article
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-lg 
                 transition duration-300 overflow-hidden group"
    >
      <Link
        to={`/recipes/${recipe?._id}`}
        className="flex flex-col h-full"
        aria-label={`View details for ${recipe?.title}`}
      >
        {/* 🖼 Recipe Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={recipe?.title || "Recipe Image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* ❤️ Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 bg-background/90 backdrop-blur-sm 
                       rounded-full flex items-center justify-center hover:bg-background 
                       hover:scale-105 transition-all duration-200"
            aria-label="Remove from favorites"
          >
            <Icon
              name="Heart"
              size={18}
              className="text-destructive fill-current transition-transform duration-150"
            />
          </button>

          {/* ⏱ Cooking Time */}
          {recipe?.cookingTime && (
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm 
                            px-2 py-1 rounded-md text-xs flex items-center space-x-1">
              <Icon name="Clock" size={13} className="text-muted-foreground" />
              <span className="text-foreground font-medium">
                {recipe?.cookingTime}
              </span>
            </div>
          )}
        </div>

        {/* 🧾 Recipe Info */}
        <div className="p-4 flex flex-col flex-grow">
          <h3
            className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-2 
                       group-hover:text-primary transition-colors duration-200"
          >
            {recipe?.title}
          </h3>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
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

          {/* 🏷 Category */}
          {recipe?.category && (
            <div className="mt-2 text-xs bg-muted px-2 py-1 rounded-md w-fit text-muted-foreground font-medium">
              {recipe.category}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default FavoriteRecipeCard;