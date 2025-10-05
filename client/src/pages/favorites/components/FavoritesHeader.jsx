import React from "react";
import Icon from "../../../components/AppIcon";

const FavoritesHeader = ({ favoriteCount = 0, searchQuery, onSearchChange }) => {
  const hasFavorites = favoriteCount > 0;

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left Section */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-1">
            My Favorites
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {hasFavorites
              ? `${favoriteCount} recipe${favoriteCount !== 1 ? "s" : ""} saved to your collection`
              : "Start building your personal recipe collection ❤️"}
          </p>
        </div>

        {/* Search Bar (only if favorites exist) */}
        {hasFavorites && (
          <div className="relative w-full md:w-80">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg 
                         text-sm text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary/70 
                         focus:border-transparent transition duration-150"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default FavoritesHeader;