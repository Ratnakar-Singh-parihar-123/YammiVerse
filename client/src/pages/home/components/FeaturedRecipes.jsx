import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeaturedRecipes = ({ featuredRecipes, onToggleFavorite, favorites }) => {
  if (!featuredRecipes || featuredRecipes?.length === 0) {
    return null;
  }

  const handleFavoriteClick = (e, recipeId) => {
    e?.preventDefault();
    e?.stopPropagation();
    onToggleFavorite(recipeId);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            Featured Recipes
          </h2>
          <p className="text-muted-foreground">
            Handpicked recipes from our community
          </p>
        </div>
        <Button
          variant="outline"
          iconName="ArrowRight"
          iconPosition="right"
          asChild
        >
          <Link to="/favorites">View All</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {featuredRecipes?.slice(0, 2)?.map((recipe) => {
          const recipeId = recipe?._id || recipe?.id; //  Mongo _id fallback
          return (
            <Link
              key={recipeId}
              to={`/recipe-details?id=${recipeId}`}
              className="group block"
            >
              <div className="bg-card rounded-lg border border-border overflow-hidden shadow-warm hover:shadow-warm-md transition-state">
                <div className="flex flex-col sm:flex-row">
                  {/* Recipe Image */}
                  <div className="relative sm:w-48 aspect-[4/3] sm:aspect-square overflow-hidden">
                    <Image
                      src={recipe?.image}
                      alt={recipe?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-state"
                    />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleFavoriteClick(e, recipeId)}
                      className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-micro"
                      aria-label={
                        favorites?.includes(recipeId)
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      <Icon
                        name="Heart"
                        size={16}
                        color={
                          favorites?.includes(recipeId)
                            ? 'var(--color-destructive)'
                            : 'var(--color-muted-foreground)'
                        }
                        className={
                          favorites?.includes(recipeId) ? 'fill-current' : ''
                        }
                      />
                    </button>

                    {/* Featured Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-md">
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="flex-1 p-6">
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-micro">
                      {recipe?.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {recipe?.description}
                    </p>

                    {/* Recipe Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        <span>{recipe?.cookingTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        <span>{recipe?.servings} servings</span>
                      </div>
                      {recipe?.difficulty && (
                        <div className="flex items-center gap-1">
                          <Icon name="BarChart3" size={14} />
                          <span>{recipe?.difficulty}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {recipe?.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Icon
                            name="Star"
                            size={14}
                            color="var(--color-warning)"
                            className="fill-current"
                          />
                          <span className="text-sm font-medium">
                            {recipe?.rating}
                          </span>
                        </div>
                        {recipe?.reviews && (
                          <span className="text-xs text-muted-foreground">
                            ({recipe?.reviews} reviews)
                          </span>
                        )}
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