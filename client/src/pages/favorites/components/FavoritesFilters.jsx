import React from 'react';
import Icon from '../../../components/AppIcon';

const FavoritesFilters = ({ 
  sortBy, 
  onSortChange, 
  filterBy, 
  onFilterChange,
  totalCount 
}) => {
  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'cookingTime', label: 'Cooking Time' },
    { value: 'difficulty', label: 'Difficulty' }
  ];

  //  Match actual schema (difficulty + category + cookingTime)
  const filterOptions = [
    { value: 'all', label: 'All Recipes' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'salad', label: 'Salad' },
    { value: 'soup', label: 'Soup' },
    { value: 'side', label: 'Side Dish' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'beverage', label: 'Beverage' },
    { value: 'quick30', label: 'Quick (≤30 min)' } //  special filter
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-card rounded-lg border border-border">
      
      {/*  Count */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Icon name="Filter" size={16} />
        <span>Showing {totalCount} recipe{totalCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        
        {/*  Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            Filter by:
          </label>
          <select
            value={filterBy}
            onChange={(e) => onFilterChange(e?.target?.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
          >
            {filterOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/*  Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e?.target?.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
          >
            {sortOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FavoritesFilters;