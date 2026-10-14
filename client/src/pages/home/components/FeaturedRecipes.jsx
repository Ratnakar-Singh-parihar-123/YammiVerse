import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getImageUrl } from '../../../utils/api';

const FeaturedRecipes = ({ featuredRecipes = [], onToggleFavorite, favorites = [] }) => {
  if (!featuredRecipes || featuredRecipes.length === 0) {
    return null;
  }

  const handleFavoriteClick = (e, recipeId) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(recipeId);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Featured Recipes
          </h2>
          <p className="text-sm text-muted-foreground">
            Handpicked culinary creations from our top chefs
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          iconName="ArrowRight"
          iconPosition="right"
          asChild
        >
          <Link to="/home#recipes">View All</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredRecipes.slice(0, 2).map((recipe) => {
          const recipeId = recipe?._id || recipe?.id;
          const imageUrl = getImageUrl(recipe?.coverImage || recipe?.image);
          const isFav =
            Array.isArray(favorites) &&
            favorites.some((fav) =>
              typeof fav === "string" ? fav === recipeId : fav?._id === recipeId
            );

          return (
            <Link
              key={recipeId}
              to={`/recipes/${recipeId}`}
              className="group block"
            >
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-warm hover:shadow-warm-md transition-all duration-300 h-full flex flex-col sm:flex-row">
                {/* Recipe Image */}
                <div className="relative sm:w-48 aspect-[4/3] sm:aspect-square overflow-hidden shrink-0 bg-muted/40">
                  <Image
                    src={imageUrl}
                    alt={recipe?.title || "Featured Recipe"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => handleFavoriteClick(e, recipeId)}
                    className="absolute top-3 right-3 w-8 h-8 bg-background/85 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-transform active:scale-95 shadow-sm"
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Icon
                      name="Heart"
                      size={16}
                      className={
                        isFav
                          ? "text-destructive fill-current"
                          : "text-muted-foreground"
                      }
                    />
                  </button>

                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 text-xs font-semibold bg-accent text-accent-foreground rounded-md uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Recipe Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    {recipe?.category && (
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
                        {recipe.category}
                      </span>
                    )}

                    <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {recipe?.title}
                    </h3>

                    {recipe?.description && (
                      <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                        {recipe.description}
                      </p>
                    )}
                  </div>

                  {/* Recipe Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
                    {recipe?.cookingTime && (
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        <span>{recipe.cookingTime}</span>
                      </div>
                    )}
                    {recipe?.servings && (
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                    {recipe?.difficulty && (
                      <div className="flex items-center gap-1">
                        <Icon name="ChefHat" size={14} />
                        <span className="capitalize">{recipe.difficulty}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedRecipes;