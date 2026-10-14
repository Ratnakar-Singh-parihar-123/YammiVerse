import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopNavigation from "../../components/ui/TopNavigation";
import SearchFilters from "./components/SearchFilters";
import RecipeGrid from "./components/RecipeGrid";
import QuickStats from "./components/QuickStats";
import FeaturedRecipes from "./components/FeaturedRecipes";
import api from "../../utils/api";
import { getAuthToken, getAuthUser } from "../../utils/auth";
import FeaturedCreators from "./components/FeaturedCreators";

/* ---------------- Small UI Helpers ---------------- */
const BannerDot = ({ active, onClick }) => (
  <button
    type="button"
    aria-label="Go to slide"
    className={`h-2.5 rounded-full transition-all duration-300 ${
      active ? "bg-primary w-8 shadow-md" : "bg-white/60 w-2.5 hover:bg-white"
    }`}
    onClick={onClick}
  />
);

const ErrorBanner = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 mb-6 border rounded-xl border-destructive/30 bg-destructive/10"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="text-destructive">
        <p className="text-sm font-semibold">Something went wrong</p>
        <p className="text-xs sm:text-sm opacity-90">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-destructive hover:bg-destructive/90 transition shadow-sm"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  </motion.div>
);

const SectionTitle = ({ title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="mb-8 text-center"
  >
    <h2 className="text-2xl font-bold sm:text-3xl font-heading text-foreground">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
        {subtitle}
      </p>
    )}
  </motion.div>
);

/* ---------------- Main HomePage ---------------- */
const HomePage = () => {
  const location = useLocation();
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    cookingTime: "",
    difficulty: "",
  });
  const [favorites, setFavorites] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [currentUser, setCurrentUser] = useState(getAuthUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Read search query parameter from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setSearchTerm(q);
  }, [location.search]);

  // Hero Banner Images
  const images = useMemo(
    () => [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80",
    ],
    [],
  );

  /* -------- Fetch Data -------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recipesRes = await api.get("/api/recipes");
      const recipeList = recipesRes.data?.recipes || [];
      setAllRecipes(recipeList);

      const token = getAuthToken();
      if (token) {
        try {
          const [userRes, favRes] = await Promise.all([
            api.get("/api/users/me"),
            api.get("/api/favorites"),
          ]);
          setCurrentUser(userRes.data?.user || null);
          setFavorites(favRes.data?.favorites || []);
        } catch {
          // If auth expired or failed, leave favorites empty
        }
      }
    } catch (err) {
      console.error("Fetch data error:", err);
      setError("Unable to load recipes. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for login/logout to refresh favorites and user
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getAuthUser());
      fetchData();
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [fetchData]);

  /* -------- Auto Banner Change -------- */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, prefersReducedMotion]);

  /* -------- Filtering -------- */
  const filteredRecipes = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    return allRecipes.filter((r) => {
      const matchesSearch =
        !s ||
        r.title?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s) ||
        r.category?.toLowerCase().includes(s);

      // Category filter
      const matchesCategory =
        !filters.category ||
        r.category?.toLowerCase() === filters.category.toLowerCase();

      // Cooking time filter
      const matchesTime =
        !filters.cookingTime ||
        (r.cookingTime &&
          parseInt(r.cookingTime, 10) <= parseInt(filters.cookingTime, 10));

      // Difficulty filter
      const matchesDifficulty =
        !filters.difficulty ||
        r.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

      return (
        matchesSearch && matchesCategory && matchesTime && matchesDifficulty
      );
    });
  }, [searchTerm, filters, allRecipes]);

  // Featured recipes (either marked featured or latest dishes)
  const featured = useMemo(() => {
    const marked = allRecipes.filter((r) => r.featured);
    if (marked.length > 0) return marked;
    return allRecipes.slice(0, 2);
  }, [allRecipes]);

  /* -------- Stats -------- */
  const stats = useMemo(
    () => ({
      totalRecipes: allRecipes.length,
      favoriteCount: favorites.length,
      recentlyAdded: allRecipes.filter((r) => r?.createdAt).length,
    }),
    [favorites, allRecipes],
  );

  /* -------- Favorites Toggle Callback -------- */
  const handleToggleFavorite = (id, isFav) => {
    setFavorites((prev) => {
      if (isFav) {
        return [...prev, id];
      }
      return prev.filter((item) =>
        typeof item === "string" ? item !== id : item?._id !== id,
      );
    });
  };

  /* -------- Render -------- */
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <main className="container px-4 py-6 mx-auto sm:px-6 sm:py-10">
        {/* Hero Banner Section */}
        <section className="relative mb-16 h-[55vh] sm:h-[65vh] max-h-[550px] min-h-[380px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-warm-lg">
          {images.map((img, i) => (
            <AnimatePresence key={img}>
              {i === current && (
                <motion.img
                  key={img}
                  src={img}
                  alt="YammiVerse Hero"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 object-cover w-full h-full"
                />
              )}
            </AnimatePresence>
          ))}

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="px-3.5 py-1 mb-3 rounded-full text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-md border border-white/30 tracking-wide uppercase"
            >
              Culinary Community
            </motion.span>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-heading drop-shadow-md"
            >
              Discover. Cook. Share. 🍲
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="max-w-2xl mt-3 text-sm font-normal leading-relaxed text-gray-200 sm:mt-4 sm:text-lg"
            >
              Explore handcrafted recipes from food lovers around the globe and
              share your own masterpieces with the world.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-6 sm:gap-4 sm:mt-8"
            >
              <Link
                to="/add-recipe"
                className="px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg sm:text-base rounded-xl bg-primary hover:bg-primary/90 hover:scale-102"
              >
                + Add Recipe
              </Link>
              <a
                href="#recipes"
                className="px-6 py-3 text-sm font-semibold text-white transition-all border sm:text-base border-white/50 backdrop-blur-sm rounded-xl hover:bg-white/20"
              >
                Browse Recipes
              </a>
            </motion.div>
          </div>

          {/* Slider Arrow Controls */}
          <button
            type="button"
            aria-label="Previous Slide"
            onClick={() =>
              setCurrent((p) => (p - 1 + images.length) % images.length)
            }
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 text-white rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition z-20"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            onClick={() => setCurrent((p) => (p + 1) % images.length)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 text-white rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition z-20"
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div className="absolute left-0 right-0 z-20 flex justify-center gap-2 bottom-4 sm:bottom-6">
            {images.map((_, i) => (
              <BannerDot
                key={i}
                active={i === current}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </section>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} onRetry={fetchData} />}

        {/* Quick Kitchen Stats */}
        <SectionTitle
          title="Your Kitchen at a Glance"
          subtitle="Track your culinary stats, favorites, and latest recipes"
        />
        <QuickStats {...stats} />

        {/* Featured Recipes Section */}
        {featured.length > 0 && (
          <FeaturedRecipes
            featuredRecipes={featured}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Recipe Search & Filters */}
        <section id="recipes" className="pt-4 mb-8">
          <SectionTitle
            title="Explore Recipes"
            subtitle="Search by dish name, meal category, cooking time, and difficulty"
          />
          <SearchFilters
            searchTerm={searchTerm}
            filters={filters}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilters}
          />
        </section>

        {/* Recipe Grid */}
        <section className="mb-16">
          <RecipeGrid
            recipes={filteredRecipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            currentUser={currentUser}
            loading={loading}
            error={error}
          />
        </section>
        <section className="mb-16">
          <FeaturedCreators />
        </section>
      </main>
    </div>
  );
};

/* -------- Hook: prefers reduced motion -------- */
function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(media.matches);
    const listener = () => setPrefers(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  return prefers;
}

export default HomePage;
