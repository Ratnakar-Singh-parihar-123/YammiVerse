import React from "react";
import Icon from "../../../components/AppIcon";

const FavoritesHeader = ({ favoriteCount = 0, searchQuery = "", onSearchChange }) => {
  return (
    <header className="mb-8 animate-fadeIn">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        
        {/* 🔹 Title & Subtitle */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            My Favorites
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {favoriteCount > 0
              ? `${favoriteCount} recipe${favoriteCount !== 1 ? "s" : ""} saved to your collection`
              : "Start building your personal recipe collection"}
          </p>
        </div>

        {/* 🔹 Search Input (only visible if there are favorites) */}
        {favoriteCount > 0 && (
          <div className="relative w-full md:w-80">
            <Icon
              name="Search"
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search your favorites..."
              aria-label="Search favorites"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(FavoritesHeader);