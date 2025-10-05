import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import TopNavigation from "../../components/ui/TopNavigation";
import FavoritesHeader from "./components/FavoritesHeader";
import FavoritesFilters from "./components/FavoritesFilters";
import FavoritesGrid from "./components/FavoritesGrid";
import EmptyFavorites from "./components/EmptyFavorites";

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  // ✅ Fetch Favorites (wrapped in useCallback for reusability)
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://yammiverse.onrender.com/api/favorites",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteRecipes(res.data?.favorites || []);
    } catch (error) {
      console.error("❌ Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchFavorites();
  }, [fetchFavorites, token]);

  // ✅ Toggle Favorite (instant update + backend sync)
  const handleToggleFavorite = async (recipeId) => {
    try {
      const isFavorite = favoriteRecipes.some((r) => r._id === recipeId);

      // Optimistic UI update (instant feel)
      if (isFavorite) {
        setFavoriteRecipes((prev) =>
          prev.filter((recipe) => recipe._id !== recipeId)
        );
        await axios.delete(
          `https://yammiverse.onrender.com/api/favorites/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://yammiverse.onrender.com/api/favorites/${recipeId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // fetch again to sync
        fetchFavorites();
      }
    } catch (error) {
      console.error("❌ Failed to toggle favorite:", error);
    }
  };

  // ✅ Filter + Sort Favorites
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = favoriteRecipes;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy !== "all") {
      filtered = filtered.filter((r) => {
        const time = parseInt(r.cookingTime);
        switch (filterBy) {
          case "quick30":
            return !isNaN(time) && time <= 30;
          case "easy":
          case "medium":
          case "hard":
            return r.difficulty?.toLowerCase() === filterBy;
          case "breakfast":
          case "lunch":
          case "dinner":
          case "snack":
          case "salad":
          case "soup":
          case "side":
          case "dessert":
          case "beverage":
            return r.category?.toLowerCase() === filterBy;
          default:
            return true;
        }
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "cookingTime":
          return parseInt(a.cookingTime) - parseInt(b.cookingTime);
        case "difficulty":
          const order = { easy: 1, medium: 2, hard: 3 };
          return (order[a.difficulty] || 99) - (order[b.difficulty] || 99);
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return sorted;
  }, [favoriteRecipes, searchQuery, sortBy, filterBy]);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <FavoritesHeader
          favoriteCount={favoriteRecipes.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading favorites...
          </div>
        ) : favoriteRecipes.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <>
            <FavoritesFilters
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
              totalCount={filteredAndSortedRecipes.length}
            />
            {filteredAndSortedRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No recipes match your filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                    setSortBy("recent");
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition"
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