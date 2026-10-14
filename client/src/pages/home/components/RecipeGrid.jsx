import React from "react";
import { Link } from "react-router-dom";
import { ChefHat, SearchX } from "lucide-react";
import RecipeCard from "./RecipeCard";

const RecipeGrid = ({
  recipes = [],
  favorites = [],
  onToggleFavorite,
  currentUser,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-card border border-border rounded-xl overflow-hidden h-80 flex flex-col"
          >
            <div className="h-44 bg-muted/70 w-full" />
            <div className="p-4 space-y-3 flex-1">
              <div className="h-4 bg-muted/60 rounded w-1/3" />
              <div className="h-6 bg-muted/80 rounded w-4/5" />
              <div className="h-3 bg-muted/50 rounded w-full" />
              <div className="h-3 bg-muted/40 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-destructive/20 bg-destructive/5 rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-destructive mb-1">
          Unable to load recipes
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-border bg-card/60 rounded-2xl p-8">
        <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4 text-muted-foreground">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
          No recipes found
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          We couldn't find any recipes matching your current search query or active filters. Try adjusting them or create a brand new dish!
        </p>
        <Link
          to="/add-recipe"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all hover:scale-102"
        >
          <ChefHat className="w-4 h-4" />
          <span>Add a New Recipe</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => {
        const isFav =
          Array.isArray(favorites) &&
          favorites.some((fav) =>
            typeof fav === "string" ? fav === recipe._id : fav?._id === recipe._id
          );

        return (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            isFavorite={isFav}
            onFavoriteUpdate={(id, state) => {
              if (onToggleFavorite) onToggleFavorite(id, state);
            }}
            currentUser={currentUser}
          />
        );
      })}
    </div>
  );
};

export default RecipeGrid;
