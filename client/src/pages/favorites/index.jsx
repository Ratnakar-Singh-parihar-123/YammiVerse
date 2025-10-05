import React, { useState, useMemo, useEffect } from "react";
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
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  // ✅ Fetch favorites from backend (Cloudinary-safe)
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          "https://yammiverse.onrender.com/api/favorites",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavoriteRecipes(res.data?.favorites || []);
      } catch (err) {
        console.error("❌ Failed to fetch favorites:", err);
        setError("Unable to load your favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchFavorites();
  }, [token]);

  // ✅ Remove from favorites (toggle)
  const handleToggleFavorite = async (recipeId) => {
    try {
      await axios.delete(
        `https://yammiverse.onrender.com/api/favorites/${recipeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteRecipes((prev) =>
        prev.filter((recipe) => recipe?._id !== recipeId)
      );
    } catch (err) {
      console.error("❌ Failed to remove favorite:", err);
      alert("Could not remove favorite. Please try again.");
    }
  };

  // ✅ Filter & Sort Recipes
  const filteredAndSortedRecipes = useMemo(() => {
    if (!favoriteRecipes?.length) return [];

    let filtered = [...favoriteRecipes];

    // 🔍 Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r?.title?.toLowerCase().includes(q) ||
          r?.description?.toLowerCase().includes(q) ||
          r?.category?.toLowerCase().includes(q)
      );
    }

    // 🎯 Category / difficulty filter
    if (filterBy !== "all") {
      filtered = filtered.filter((r) => {
        const cookTime = parseInt(r?.cookingTime);
        switch (filterBy) {
          case "quick30":
            return !isNaN(cookTime) && cookTime <= 30;
          case "easy":
          case "medium":
          case "hard":
            return r?.difficulty?.toLowerCase() === filterBy;
          case "breakfast":
          case "lunch":
          case "dinner":
          case "snack":
          case "salad":
          case "soup":
          case "side":
          case "dessert":
          case "beverage":
            return r?.category?.toLowerCase() === filterBy;
          default:
            return true;
        }
      });
    }

    // 🔃 Sorting
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a?.title?.localeCompare(b?.title);
        case "cookingTime":
          return parseInt(a?.cookingTime) - parseInt(b?.cookingTime);
        case "difficulty":
          const order = { easy: 1, medium: 2, hard: 3 };
          return (order[a?.difficulty] || 99) - (order[b?.difficulty] || 99);
        case "recent":
        default:
          return new Date(b?.createdAt) - new Date(a?.createdAt);
      }
    });

    return sorted;
  }, [favoriteRecipes, searchQuery, sortBy, filterBy]);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        {/* 🔹 Header */}
        <FavoritesHeader
          favoriteCount={favoriteRecipes.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 🔹 Loader */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Loading your favorites...
          </div>
        )}

        {/* 🔹 Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* 🔹 Empty State */}
        {!loading && !error && favoriteRecipes.length === 0 && (
          <EmptyFavorites />
        )}

        {/* 🔹 Main Content */}
        {!loading && !error && favoriteRecipes.length > 0 && (
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
                  No recipes match your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                    setSortBy("recent");
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-micro"
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