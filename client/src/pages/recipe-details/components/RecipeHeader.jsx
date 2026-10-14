import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import Button from "../../../components/ui/Button";
import { getImageUrl } from "../../../utils/api";

const RecipeHeader = ({
  recipe = {},
  isFavorite,
  onToggleFavorite,
  onDelete,
  currentUser,
}) => {
  if (!recipe?.title) {
    return (
      <div className="p-8 bg-card border border-border rounded-2xl text-center text-muted-foreground">
        Loading recipe details...
      </div>
    );
  }

  const imageUrl = getImageUrl(recipe?.coverImage || recipe?.image);

  // Check creator ownership
  const recipeCreatorId =
    typeof recipe?.createdBy === "string"
      ? recipe.createdBy
      : recipe?.createdBy?._id;

  const currentUserId = currentUser?._id;
  const isOwner = Boolean(
    currentUserId && recipeCreatorId && currentUserId.toString() === recipeCreatorId.toString()
  );

  const cookingTime = recipe?.cookingTime || recipe?.time;
  const authorName = recipe?.createdBy?.fullName || "YammiVerse Chef";
  const authorAvatar = recipe?.createdBy?.avatar ? getImageUrl(recipe.createdBy.avatar) : null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-warm-lg overflow-hidden">
      {/* Recipe Cover Image */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[420px] overflow-hidden bg-muted/40">
        <Image
          src={imageUrl}
          alt={recipe?.title || "Recipe"}
          className="w-full h-full object-cover"
        />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 w-11 h-11 bg-background/85 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background transition-all shadow-md active:scale-95 z-10"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          <Icon
            name="Heart"
            size={22}
            className={
              isFavorite
                ? "text-destructive fill-current"
                : "text-muted-foreground hover:text-foreground"
            }
          />
        </button>

        {/* Category Pill */}
        {recipe?.category && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-primary text-primary-foreground uppercase tracking-wider shadow-sm">
              {recipe.category}
            </span>
          </div>
        )}
      </div>

      {/* Recipe Info Header */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-foreground mb-3 leading-tight">
              {recipe?.title}
            </h1>

            {/* Author info */}
            <div className="flex items-center gap-2.5 mb-4 text-sm text-muted-foreground">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>By <strong className="text-foreground">{authorName}</strong></span>
              {recipe?.createdAt && (
                <>
                  <span>•</span>
                  <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                </>
              )}
            </div>

            {/* Meta Badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
              {cookingTime && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/60">
                  <Icon name="Clock" size={16} className="text-primary" />
                  <span className="font-medium text-foreground">{cookingTime}</span>
                </div>
              )}

              {recipe?.servings && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/60">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span className="font-medium text-foreground">
                    {recipe.servings} servings
                  </span>
                </div>
              )}

              {recipe?.difficulty && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/60">
                  <Icon name="ChefHat" size={16} className="text-primary" />
                  <span className="font-medium text-foreground capitalize">
                    {recipe.difficulty}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Owner-only Action Buttons */}
          {isOwner && (
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={`/edit-recipe/${recipe?._id || recipe?.id}`}
                className="px-4 py-2 text-sm font-semibold border border-border rounded-lg bg-card hover:bg-muted text-foreground transition shadow-sm flex items-center gap-2"
              >
                <Icon name="Edit" size={16} />
                <span>Edit Recipe</span>
              </Link>

              <Button
                variant="destructive"
                iconName="Trash2"
                iconPosition="left"
                onClick={onDelete}
                className="font-semibold"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Recipe Description */}
        {recipe?.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              About This Dish
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed">
              {recipe.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeHeader;
