import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import TopNavigation from "../../components/ui/TopNavigation";
import SearchFilters from "./components/SearchFilters";
import RecipeGrid from "./components/RecipeGrid";
import QuickStats from "./components/QuickStats";
import FeaturedRecipes from "./components/FeaturedRecipes";

/* ---------------- Small UI Helpers ---------------- */
const BannerDot = ({ active, onClick }) => (
  <button
    className={`h-3 w-3 rounded-full transition-all ${
      active ? "bg-primary scale-125 shadow-lg" : "bg-white/50 hover:bg-white"
    }`}
    onClick={onClick}
  />
);

const ErrorBanner = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="text-destructive">
        <p className="font-medium">Something went wrong</p>
        <p className="text-sm opacity-80">{message}</p>
      </div>
      {onRetry && (
        <button
          className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-white hover:bg-destructive/90"
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
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="mb-8 text-center"
  >
    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
    {subtitle && (
      <p className="mt-1 text-sm text-muted-foreground sm:text-base">
        {subtitle}
      </p>
    )}
  </motion.div>
);

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-muted/60 ${className}`} />
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
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("rh-favorites") || "[]")
  );
  const [allRecipes, setAllRecipes] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  //  Pick search from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setSearchTerm(q);
  }, [location.search]);

  // Hero Banner Images
  const images = useMemo(
    () => [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1600&q=80",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMG219LaxqNmWoCqpmDTdgi4i4dUHWrJ2K6g&s",
      "https://t3.ftcdn.net/jpg/01/79/59/92/360_F_179599293_7mePKnajSM4bggDa8NkKpcAHKl3pow2l.jpg",
    ],
    []
  );

  /* -------- Fetch Data -------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recipesRes = await axios.get("https://yammiverse.onrender.com/api/recipes");
      setAllRecipes(recipesRes.data?.recipes || []);
      setFeatured(recipesRes.data?.recipes.filter((r) => r.featured) || []);

      const token = localStorage.getItem("recipeHub-token");
      if (token) {
        try {
          const userRes = await axios.get(
            "https://yammiverse.onrender.com/api/users/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCurrentUser(userRes.data?.user || null);
        } catch {
          setCurrentUser(null);
        }
      }
    } catch {
      setError("Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* -------- Auto Banner Change -------- */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length, prefersReducedMotion]);

  /* -------- Filtering -------- */
  const filteredRecipes = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return allRecipes.filter((r) => {
      const matchesSearch =
        !s ||
        r.title?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s);

      //  Category filter
      const matchesCategory =
        !filters.category || r.category?.toLowerCase() === filters.category.toLowerCase();

      //  Cooking time filter (numeric)
      const matchesTime =
        !filters.cookingTime ||
        (r.cookingTime &&
          parseInt(r.cookingTime) <= parseInt(filters.cookingTime));

      //  Difficulty filter (case-insensitive)
      const matchesDifficulty =
        !filters.difficulty ||
        r.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesTime && matchesDifficulty;
    });
  }, [searchTerm, filters, allRecipes]);

  /* -------- Stats -------- */
  const stats = useMemo(
    () => ({
      totalRecipes: allRecipes.length,
      favoriteCount: favorites.length,
      recentlyAdded: allRecipes.filter((r) => r?.createdAt).length,
    }),
    [favorites, allRecipes]
  );

  /* -------- Favorites -------- */
  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
    localStorage.setItem(
      "rh-favorites",
      JSON.stringify(
        favorites.includes(id)
          ? favorites.filter((fid) => fid !== id)
          : [...favorites, id]
      )
    );
  };

  /* -------- Render -------- */
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation currentUser={currentUser} />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <section className="relative mb-16 h-[70vh] sm:h-[80vh] overflow-hidden rounded-xl shadow-2xl">
          {images.map((img, i) => (
            <AnimatePresence key={i}>
              {i === current && (
                <motion.img
                  key={i}
                  src={img}
                  alt={`Slide ${i}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
          {/* Text */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-4xl font-extrabold sm:text-6xl drop-shadow-lg"
            >
              Discover. Cook. Share. 🍲
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 max-w-2xl text-base sm:text-lg text-gray-200"
            >
              Explore recipes from around the world 🌎 and share your own with
              foodies everywhere.
            </motion.p>
            <div className="mt-6 flex gap-4">
              <Link
                to="/add-recipe"
                className="rounded-lg bg-primary px-6 py-3 text-lg font-medium text-white hover:bg-primary/90 shadow-md"
              >
                Add Recipe
              </Link>
              <a
                href="#recipes"
                className="rounded-lg border border-white/40 px-6 py-3 text-lg text-white hover:bg-white/20"
              >
                Browse
              </a>
            </div>
          </div>
          {/* Controls */}
          <button
            onClick={() =>
              setCurrent((p) => (p - 1 + images.length) % images.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            ›
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
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

        {/* Stats */}
        <SectionTitle
          title="Your Kitchen at a Glance"
          subtitle="Track your food journey"
        />
        <QuickStats {...stats} />

        {/* Featured */}
        <SectionTitle
          title="Featured Recipes"
          subtitle="Handpicked by our chefs"
        />
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
          </div>
        ) : (
          <FeaturedRecipes
            featuredRecipes={featured}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Filters */}
        <SectionTitle
          title="Find Your Next Dish"
          subtitle="Search by category, time & difficulty"
        />
        <SearchFilters
          searchTerm={searchTerm}
          filters={filters}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilters}
        />

        {/* Recipes */}
        <section id="recipes" className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              <RecipeGrid
                recipes={filteredRecipes}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                currentUser={currentUser}
              />
            </motion.div>
          )}
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