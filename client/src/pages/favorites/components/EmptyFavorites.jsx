import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyFavorites = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="Heart" size={40} className="text-muted-foreground" />
      </div>
      
      <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
        No Favorites Yet
      </h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Start exploring recipes and tap the heart icon to save your favorites. 
        Build your personal collection of go-to recipes!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/home">
          <Button variant="default" iconName="Home" iconPosition="left">
            Browse Recipes
          </Button>
        </Link>
        
        <Link to="/add-recipe">
          <Button variant="outline" iconName="Plus" iconPosition="left">
            Add Your Recipe
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyFavorites;