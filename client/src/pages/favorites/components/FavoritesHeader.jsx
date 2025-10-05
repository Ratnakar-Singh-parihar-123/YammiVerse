import React from "react";
import Icon from "../../../components/AppIcon";

const FavoritesHeader = ({ favoriteCount = 0, searchQuery = "", onSearchChange }) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* 🔹 Title & Subtitle */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            My Favorites
          </h1>
          <p className="text-muted-foreground">
            {favoriteCount > 0
              ? `${favoriteCount} recipe${favoriteCount !== 1 ? "s" : ""} saved in your collection`
              : "You haven’t saved any recipes yet. Start adding your favorites!"}
          </p>
        </div>

        {/* 🔹 Search Bar (Visible only if favorites exist) */}
        {favoriteCount > 0 && (
          <div className="relative w-full md:w-80">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search your favorite recipes..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent transition-all duration-200"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default FavoritesHeader;