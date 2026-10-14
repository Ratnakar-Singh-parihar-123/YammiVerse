import React, { useState, useMemo, useEffect } from "react";
import TopNavigation from "../../components/ui/TopNavigation";
import FavoritesHeader from "./components/FavoritesHeader";
import FavoritesFilters from "./components/FavoritesFilters";
import FavoritesGrid from "./components/FavoritesGrid";
import EmptyFavorites from "./components/EmptyFavorites";
import api from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getAuthToken();

  // Fetch favorites from backend
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/favorites");
        setFavoriteRecipes(res.data?.favorites || []);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setError("Failed to load your favorite recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Toggle Favorite (Remove from list)
  const handleToggleFavorite = async (recipeId) => {
    try {
      await api.delete(`/api/favorites/${recipeId}`);
      // Remove from local state
      setFavoriteRecipes((prev) =>
        prev?.filter((recipe) => recipe?._id !== recipeId)
      );
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  // Filter + Sort Recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = favoriteRecipes;

    // Search filter (title + description + category)
    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered?.filter(
        (recipe) =>
          recipe?.title?.toLowerCase()?.includes(q) ||
          recipe?.description?.toLowerCase()?.includes(q) ||
          recipe?.category?.toLowerCase()?.includes(q)
      );
    }

    // Custom filter
    if (filterBy !== "all") {
      filtered = filtered?.filter((recipe) => {
        const cookingTime = parseInt(recipe?.cookingTime, 10);

        switch (filterBy) {
          case "quick30":
            return !isNaN(cookingTime) && cookingTime <= 30;

          case "easy":
          case "medium":
          case "hard":
            return recipe?.difficulty?.toLowerCase() === filterBy;

          case "breakfast":
          case "lunch":
          case "dinner":
          case "snack":
          case "salad":
          case "soup":
          case "side":
          case "dessert":
          case "beverage":
            return recipe?.category?.toLowerCase() === filterBy;

          default:
            return true;
        }
      });
    }

    // Sorting
    const sorted = [...(filtered || [])]?.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return (a?.title || "").localeCompare(b?.title || "");

        case "cookingTime":
          return (parseInt(a?.cookingTime, 10) || 0) - (parseInt(b?.cookingTime, 10) || 0);

        case "difficulty": {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (
            (difficultyOrder[a?.difficulty?.toLowerCase()] || 99) -
            (difficultyOrder[b?.difficulty?.toLowerCase()] || 99)
          );
        }

        case "recent":
        default:
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      }
    });

    return sorted;
  }, [favoriteRecipes, searchQuery, sortBy, filterBy]);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        {/* Header with Search */}
        <FavoritesHeader
          favoriteCount={favoriteRecipes?.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="font-medium underline hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loader */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        ) : favoriteRecipes?.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <>
            {/* Filters & Sorting */}
            <FavoritesFilters
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
              totalCount={filteredAndSortedRecipes?.length}
            />

            {/* No results after filters */}
            {filteredAndSortedRecipes?.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
                <p className="text-muted-foreground text-lg mb-4">
                  No recipes match your current search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                    setSortBy("recent");
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <FavoritesGrid
                recipes={filteredAndSortedRecipes}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
