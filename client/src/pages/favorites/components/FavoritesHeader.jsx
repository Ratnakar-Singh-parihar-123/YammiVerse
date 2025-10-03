import React from 'react';
import Icon from '../../../components/AppIcon';

const FavoritesHeader = ({ favoriteCount, searchQuery, onSearchChange }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            My Favorites
          </h1>
          <p className="text-muted-foreground">
            {favoriteCount > 0 
              ? `${favoriteCount} recipe${favoriteCount !== 1 ? 's' : ''} saved to your collection`
              : 'Start building your personal recipe collection'
            }
          </p>
        </div>
        
        {favoriteCount > 0 && (
          <div className="relative w-full md:w-80">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesHeader;