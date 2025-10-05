import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const FavoriteRecipeCard = React.memo(({ recipe, onToggleFavorite }) => {
  if (!recipe) return null;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(recipe?._id);
  };

  // ✅ Normalize image URL (Cloudinary or local upload)
  let imageUrl = recipe?.coverImage || recipe?.image || "";
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrl = `https://yammiverse.onrender.com${
      imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
    }`;
  }

  // ✅ Fallbacks
  const localFallback = "/assets/images/no_image.png"; // Add this to your public folder
  const remoteFallback = "https://placehold.co/600x400?text=No+Image&font=inter";

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
      {/* ✅ Clickable Card */}
      <Link to={`/recipes/${recipe?._id}`} className="block">
        {/* 🔹 Image Section */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl || localFallback}
            alt={recipe?.title || "Recipe image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Primary fallback to local image
              if (!e.target.dataset.fallbackTried) {
                e.target.src = localFallback;
                e.target.dataset.fallbackTried = "true";
              } else {
                // Secondary fallback if even local image fails
                e.target.src = remoteFallback;
              }
            }}
          />

          {/* ❤️ Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-all duration-200"
            aria-label="Remove from favorites"
          >
            <Icon
              name="Heart"
              size={20}
              className="text-destructive fill-current transition-transform duration-200 group-hover:scale-110"
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

        {/* 🔹 Info Section */}
        <div className="p-4">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe?.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
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

          {/* 🔹 Tags */}
          {recipe?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-muted text-xs font-medium text-muted-foreground rounded-md"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 bg-muted text-xs font-medium text-muted-foreground rounded-md">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

export default FavoriteRecipeCard;