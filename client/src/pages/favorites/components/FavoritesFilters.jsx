import React from "react";
import Icon from "../../../components/AppIcon";

const FavoritesFilters = ({
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  totalCount,
}) => {
  const sortOptions = [
    { value: "recent", label: "Recently Added" },
    { value: "alphabetical", label: "A-Z" },
    { value: "cookingTime", label: "Cooking Time" },
    { value: "difficulty", label: "Difficulty" },
  ];

  // ✅ Matches actual schema fields (difficulty, category, cookingTime)
  const filterOptions = [
    { value: "all", label: "All Recipes" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
    { value: "salad", label: "Salad" },
    { value: "soup", label: "Soup" },
    { value: "side", label: "Side Dish" },
    { value: "dessert", label: "Dessert" },
    { value: "beverage", label: "Beverage" },
    { value: "quick30", label: "Quick (≤30 min)" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-card rounded-lg border border-border shadow-sm transition-all duration-200">
      {/* 🔹 Left Section — Count */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Icon name="Filter" size={16} />
        <span>
          Showing{" "}
          <span className="font-medium text-foreground">
            {totalCount || 0}
          </span>{" "}
          recipe{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* 🔹 Right Section — Filters & Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="filterSelect"
            className="text-sm font-medium text-foreground whitespace-nowrap"
          >
            Filter by:
          </label>
          <select
            id="filterSelect"
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       transition-all duration-150 hover:border-primary/50"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="sortSelect"
            className="text-sm font-medium text-foreground whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       transition-all duration-150 hover:border-primary/50"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FavoritesFilters;