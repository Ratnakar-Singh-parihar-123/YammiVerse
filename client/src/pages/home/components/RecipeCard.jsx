import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const RecipeCard = ({ recipe, isFavorite, onFavoriteUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const navigate = useNavigate();
  const token = localStorage.getItem("recipeHub-token");

  // 🔹 Keep local state in sync with parent
  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  // 🔹 Toggle Favorite API
  const handleFavoriteClick = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      if (favorite) {
        await axios.delete(
          `https://yammiverse.onrender.com/api/favorites/${recipe?._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorite(false);
        onFavoriteUpdate?.(recipe?._id, false);
      } else {
        await axios.post(
          `https://yammiverse.onrender.com/api/favorites/${recipe?._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorite(true);
        onFavoriteUpdate?.(recipe?._id, true);
      }
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    }
  };

  // 🔹 Difficulty Badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-success bg-success/10";
      case "medium":
        return "text-warning bg-warning/10";
      case "hard":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  // 🔹 Construct image URL
  let imageUrl =
    recipe?.coverImage || recipe?.image
      ? recipe?.image?.startsWith("http")
        ? recipe?.image
        : `https://yammiverse.onrender.com/${recipe?.image?.replace(/\\/g, "/")}`
      : null;

  if (!imageUrl) {
    imageUrl = "https://via.placeholder.com/400x300?text=No+Image";
  }

  return (
    <div
      className="group bg-card rounded-lg border border-border overflow-hidden shadow-warm hover:shadow-warm-md transition-state"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/recipes/${recipe?._id}`} className="block">
        {/* Recipe Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={recipe?.title || "Recipe image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-state"
          />

          {/* ❤️ Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-micro"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Icon
              name="Heart"
              size={20}
              className={
                favorite
                  ? "text-destructive fill-current"
                  : "text-muted-foreground"
              }
            />
          </button>

          {/* Difficulty Badge */}
          {recipe?.difficulty && (
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-md ${getDifficultyColor(
                  recipe?.difficulty
                )}`}
              >
                {recipe?.difficulty}
              </span>
            </div>
          )}

          {/* Quick Action Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-micro">
              <Button
                variant="secondary"
                size="sm"
                iconName="Eye"
                iconPosition="left"
                onClick={(e) => {
                  e?.preventDefault();
                  navigate(`/recipes/${recipe?._id}`);
                }}
              >
                View Recipe
              </Button>
            </div>
          )}
        </div>

        {/* Recipe Content */}
        <div className="p-4">
          <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-micro">
            {recipe?.title}
          </h3>

          {/* Recipe Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {recipe?.cookingTime && (
              <div className="flex items-center gap-1">
                <Icon name="Clock" size={16} />
                <span>
                  {isNaN(recipe?.cookingTime)
                    ? recipe?.cookingTime
                    : `${recipe?.cookingTime} min`}
                </span>
              </div>
            )}
            {recipe?.servings && (
              <div className="flex items-center gap-1">
                <Icon name="Users" size={16} />
                <span>{recipe?.servings} servings</span>
              </div>
            )}
            {recipe?.cuisine && (
              <div className="flex items-center gap-1">
                <Icon name="MapPin" size={16} />
                <span>{recipe?.cuisine}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {recipe?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {recipe?.description}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;