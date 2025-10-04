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

  const token = localStorage.getItem("recipeHub-token");

  // 🔹 Fetch favorites from backend
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://yammiverse.onrender.com/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteRecipes(res.data?.favorites || []);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchFavorites();
  }, [token]);

  // 🔹 Toggle Favorite (Remove from list)
  const handleToggleFavorite = async (recipeId) => {
    try {
      await axios.delete(`https://yammiverse.onrender.com/api/favorites/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoriteRecipes((prev) =>
        prev?.filter((recipe) => recipe?._id !== recipeId)
      );
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  // 🔹 Filter + Sort Recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = favoriteRecipes;

    // 🔍 Search filter
    if (searchQuery?.trim()) {
      filtered = filtered?.filter(
        (recipe) =>
          recipe?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          recipe?.description?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          recipe?.category?.toLowerCase()?.includes(searchQuery.toLowerCase())
      );
    }

    // 🎯 Custom filter
    if (filterBy !== "all") {
      filtered = filtered?.filter((recipe) => {
        const cookingTime = parseInt(recipe?.time); // ✅ fixed
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

    // 🔃 Sorting
    const sorted = [...filtered]?.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a?.title?.localeCompare(b?.title);
        case "cookingTime":
          return parseInt(a?.time) - parseInt(b?.time); // ✅ fixed
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (
            (difficultyOrder?.[a?.difficulty?.toLowerCase()] || 99) -
            (difficultyOrder?.[b?.difficulty?.toLowerCase()] || 99)
          );
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
        {/* Header with Search */}
        <FavoritesHeader
          favoriteCount={favoriteRecipes?.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Loader */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading favorites...
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
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No recipes match your current filters
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