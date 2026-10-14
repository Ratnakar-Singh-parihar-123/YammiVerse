import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import api, { getImageUrl } from "../../../utils/api";
import { getAuthToken } from "../../../utils/auth";

const RecipeCard = ({ recipe, isFavorite = false, onFavoriteUpdate, currentUser }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  // Backend Toggle Favorite
  const handleFavoriteClick = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    if (isUpdatingFavorite) return;

    setIsUpdatingFavorite(true);
    try {
      if (favorite) {
        await api.delete(`/api/favorites/${recipe?._id}`);
        setFavorite(false);
        if (onFavoriteUpdate) onFavoriteUpdate(recipe?._id, false);
      } else {
        await api.post(`/api/favorites/${recipe?._id}`);
        setFavorite(true);
        if (onFavoriteUpdate) onFavoriteUpdate(recipe?._id, true);
      }
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  // Difficulty Badge color
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-success bg-success/15 border-success/30";
      case "medium":
        return "text-warning bg-warning/15 border-warning/30";
      case "hard":
        return "text-destructive bg-destructive/15 border-destructive/30";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const imageUrl = getImageUrl(recipe?.coverImage || recipe?.image);
  const isOwner =
    currentUser?._id && recipe?.createdBy?._id &&
    currentUser._id.toString() === recipe.createdBy._id.toString();

  return (
    <div
      className="overflow-hidden border rounded-xl group bg-card border-border shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/recipes/${recipe?._id}`} className="block flex-1 flex flex-col">
        {/* Recipe Image & Overlay Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted/40">
          <Image
            src={imageUrl}
            alt={recipe?.title || "Recipe"}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          {/* ❤️ Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isUpdatingFavorite}
            className="absolute flex items-center justify-center w-9 h-9 rounded-full top-3 right-3 bg-background/85 backdrop-blur-md hover:bg-background transition-transform active:scale-90 shadow-md z-10"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            title={favorite ? "Remove from favorites" : "Save to favorites"}
          >
            <Icon
              name="Heart"
              size={18}
              className={
                favorite
                  ? "text-destructive fill-current"
                  : "text-muted-foreground hover:text-foreground"
              }
            />
          </button>

          {/* Difficulty Badge */}
          {recipe?.difficulty && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border uppercase tracking-wider ${getDifficultyBadge(
                  recipe?.difficulty
                )}`}
              >
                {recipe.difficulty}
              </span>
            </div>
          )}

          {/* Quick Action Overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 hidden sm:flex items-center justify-center bg-black/30 backdrop-blur-xs transition-opacity animate-fadeIn z-5">
              <Button
                variant="secondary"
                size="sm"
                iconName="Eye"
                iconPosition="left"
                onClick={(e) => {
                  e?.preventDefault();
                  navigate(`/recipes/${recipe?._id}`);
                }}
                className="shadow-md font-semibold text-xs"
              >
                View Recipe
              </Button>
            </div>
          )}
        </div>

        {/* Recipe Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {recipe?.category && (
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1 block">
                {recipe.category}
              </span>
            )}

            <h3 className="text-base sm:text-lg font-heading font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {recipe?.title}
            </h3>

            {recipe?.description && (
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Recipe Meta */}
          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {recipe?.cookingTime && (
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span>{recipe.cookingTime}</span>
                </div>
              )}
              {recipe?.servings && (
                <div className="flex items-center gap-1">
                  <Icon name="Users" size={14} className="text-muted-foreground" />
                  <span>{recipe.servings} serv</span>
                </div>
              )}
            </div>

            {isOwner && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Yours
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;
