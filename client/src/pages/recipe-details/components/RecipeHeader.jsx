import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import Button from "../../../components/ui/Button";

const RecipeHeader = ({
  recipe = {},
  isFavorite,
  onToggleFavorite,
  onDelete,
  currentUser,
}) => {
  const navigate = useNavigate();

  if (!recipe?.title) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg text-center text-muted-foreground">
        Loading recipe details...
      </div>
    );
  }

  // ✅ Centralized safe image URL resolver (Cloudinary + Local + Fallback)
  const getImageUrl = (imagePath) => {
    const localFallback = "/assets/images/no_image.png";
    const remoteFallback =
      "https://placehold.co/600x400/e5e7eb/1f2937?text=No+Image";

    if (!imagePath) return localFallback;

    // ✅ If it's a valid Cloudinary or external image
    if (imagePath.startsWith("http")) return imagePath;

    // ✅ Otherwise, assume it's uploaded via backend (public/uploads)
    const baseUrl = "https://yammiverse.onrender.com";
    const fullPath = `${baseUrl}${
      imagePath.startsWith("/") ? imagePath : `/${imagePath}`
    }`;

    // ✅ Some old data might have wrong format — ensure fallback safety
    return fullPath || remoteFallback;
  };

  const imageUrl = getImageUrl(recipe?.coverImage || recipe?.image);

  // ✅ Owner check
  const isOwner =
    currentUser?._id?.toString() === recipe?.createdBy?._id?.toString();

  return (
    <div className="bg-card rounded-lg shadow-warm overflow-hidden">
      {/* 🔹 Recipe Image */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <Image
          src={imageUrl}
          alt={recipe?.title || "Recipe image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback order: uploaded → local → CDN
            if (!e.target.dataset.fallbackTried) {
              e.target.src = "/assets/images/no_image.png";
              e.target.dataset.fallbackTried = "true";
            } else {
              e.target.src =
                "https://placehold.co/600x400/e5e7eb/1f2937?text=No+Image";
            }
          }}
        />

        {/* ❤️ Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className="absolute top-4 right-4 w-12 h-12 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-micro shadow-warm"
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Icon
            name="Heart"
            size={24}
            className={`transition-all duration-300 ${
              isFavorite
                ? "text-destructive fill-destructive"
                : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* 🔹 Recipe Info */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-2">
              {recipe?.title}
            </h1>

            {/* 🔸 Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {recipe?.cookingTime && (
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={18} />
                  <span className="text-sm font-medium">
                    {recipe.cookingTime}
                  </span>
                </div>
              )}
              {recipe?.servings && (
                <div className="flex items-center gap-2">
                  <Icon name="Users" size={18} />
                  <span className="text-sm font-medium">
                    {recipe.servings} servings
                  </span>
                </div>
              )}
              {recipe?.difficulty && (
                <div className="flex items-center gap-2">
                  <Icon name="ChefHat" size={18} />
                  <span className="text-sm font-medium capitalize">
                    {recipe.difficulty}
                  </span>
                </div>
              )}
              {recipe?.category && (
                <div className="flex items-center gap-2">
                  <Icon name="Tag" size={18} />
                  <span className="text-sm font-medium capitalize">
                    {recipe.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 👤 Owner Controls */}
          {isOwner && (
            <div className="flex items-center space-x-3">
              <Link
                to={`/edit-recipe/${recipe?._id || recipe?.id}`}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition flex items-center justify-center min-w-[100px]"
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </Link>

              <Button
                variant="destructive"
                iconName="Trash2"
                iconPosition="left"
                onClick={onDelete}
                className="min-w-[100px]"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* 🔹 Description */}
        {recipe?.description && (
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {recipe.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecipeHeader;