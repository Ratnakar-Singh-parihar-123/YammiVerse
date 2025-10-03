import React, { useState } from "react";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

const SearchFilters = ({ onSearchChange, onFilterChange, searchTerm, filters }) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Breakfast", label: "Breakfast" },
    { value: "Lunch", label: "Lunch" },
    { value: "Dinner", label: "Dinner" },
    { value: "Snack", label: "Snack" },
    { value: "Salad", label: "Salad" },
    { value: "Soup", label: "Soup" },
    { value: "Side Dish", label: "Side Dish" },
    { value: "Vegetarian", label: "Vegetarian" },
    { value: "Vegan", label: "Vegan" },
    { value: "Dessert", label: "Dessert" },
    { value: "Beverage", label: "Beverage" },
  ];

  const cookingTimeOptions = [
    { value: "", label: "Any Time" },
    { value: "15", label: "Under 15 minutes" },
    { value: "30", label: "Under 30 minutes" },
    { value: "60", label: "Under 1 hour" },
    { value: "120", label: "Under 2 hours" },
  ];

  const difficultyOptions = [
    { value: "", label: "All Levels" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const handleClearFilters = () => {
    onSearchChange("");
    onFilterChange({
      category: "",
      cookingTime: "",
      difficulty: "",
    });
  };

  const hasActiveFilters =
    searchTerm || filters?.category || filters?.cookingTime || filters?.difficulty;

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-warm mb-8">
      {/* 🔍 Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search recipes by name, description or category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            iconName={isFiltersExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            aria-expanded={isFiltersExpanded}
          >
            Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* 🧑‍🍳 Filter Controls */}
      {isFiltersExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border animate-fadeIn">
          <Select
            label="Category"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => onFilterChange({ ...filters, category: value })}
            placeholder="Select category"
          />
          <Select
            label="Cooking Time"
            options={cookingTimeOptions}
            value={filters?.cookingTime}
            onChange={(value) => onFilterChange({ ...filters, cookingTime: value })}
            placeholder="Select time"
          />
          <Select
            label="Difficulty"
            options={difficultyOptions}
            value={filters?.difficulty}
            onChange={(value) => onFilterChange({ ...filters, difficulty: value })}
            placeholder="Select difficulty"
          />
        </div>
      )}
    </div>
  );
};

export default SearchFilters;