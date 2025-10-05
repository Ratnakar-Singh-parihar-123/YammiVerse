import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const EmptyFavorites = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* ❤️ Icon */}
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Icon name="Heart" size={40} className="text-muted-foreground" />
      </div>

      {/* 🔹 Heading */}
      <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-3">
        No Favorites Yet
      </h2>

      {/* 🔹 Subtext */}
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-10 leading-relaxed">
        Start exploring recipes and tap the <span className="font-medium">heart</span> icon to save your favorites.
        Build your personal collection of go-to recipes and discover new favorites!
      </p>

      {/* 🔹 CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/home" className="w-full sm:w-auto">
          <Button
            variant="default"
            iconName="Home"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Browse Recipes
          </Button>
        </Link>

        <Link to="/add-recipe" className="w-full sm:w-auto">
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Add Your Recipe
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyFavorites;