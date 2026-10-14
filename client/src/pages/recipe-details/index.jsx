import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import TopNavigation from "../../components/ui/TopNavigation";
import RecipeHeader from "./components/RecipeHeader";
import IngredientsList from "./components/IngredientsList";
import InstructionsList from "./components/InstructionsList";
import NutritionInfo from "./components/NutritionInfo";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import api from "../../utils/api";
import { getAuthToken, getAuthUser } from "../../utils/auth";
import Icon from "../../components/AppIcon";

const RecipeDetailsPage = () => {
  const navigate = useNavigate();
  const { id: recipeId } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(getAuthUser());
  const [errorMessage, setErrorMessage] = useState(null);

  const token = getAuthToken();

  // Fetch recipe + user + favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. Get recipe details (publicly accessible)
        const res = await api.get(`/api/recipes/${recipeId}`);
        const recipeData = res.data.recipe || res.data;
        setRecipe(recipeData);

        // 2. If user is logged in, fetch their info and favorites status
        if (token) {
          try {
            const [userRes, favRes] = await Promise.all([
              api.get("/api/users/me"),
              api.get("/api/favorites"),
            ]);
            setCurrentUser(userRes.data?.user || null);

            const favorites = favRes.data?.favorites || [];
            const isFav = favorites.some((fav) =>
              typeof fav === "string" ? fav === recipeId : fav?._id === recipeId
            );
            setIsFavorite(isFav);
          } catch (authErr) {
            console.warn("Could not fetch user session on recipe details:", authErr);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching recipe details:", err);
        setErrorMessage(err.response?.data?.message || "Failed to load recipe details.");
        setRecipe(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      fetchData();
    }
  }, [recipeId, token]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${recipeId}`);
        setIsFavorite(false);
      } else {
        await api.post(`/api/favorites/${recipeId}`);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    }
  };

  // Edit recipe navigation
  const handleEdit = () => {
    navigate(`/edit-recipe/${recipeId}`);
  };

  // Delete recipe
  const handleDelete = () => setIsDeleteModalOpen(true);

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/recipes/${recipeId}`);
      navigate("/home", {
        state: { message: "Recipe deleted successfully!" },
      });
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete recipe");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-3 rounded-full animate-spin border-primary border-t-transparent" />
            <p className="text-muted-foreground font-medium">Preparing delicious details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not found / Error state
  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center max-w-md p-8 border border-border bg-card rounded-2xl shadow-warm">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertCircle" size={32} />
            </div>
            <h1 className="mb-2 text-2xl font-bold font-heading text-foreground">
              Recipe Not Found
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {errorMessage || "The recipe you are looking for doesn't exist or may have been deleted."}
            </p>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              <Icon name="ArrowLeft" size={16} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Recipe Details
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <main className="container max-w-5xl px-4 sm:px-6 py-6 sm:py-10 mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Back to All Recipes</span>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <RecipeHeader
            recipe={recipe}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUser={currentUser}
          />

          {/* Recipe Content: Ingredients & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <IngredientsList ingredients={recipe?.ingredients} />
            </div>
            <div className="lg:col-span-2">
              <InstructionsList instructions={recipe?.instructions} />
            </div>
          </div>

          {/* Nutrition info if available */}
          {recipe?.nutrition && <NutritionInfo nutrition={recipe?.nutrition} />}
        </div>
      </main>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        recipeName={recipe?.title}
      />
    </div>
  );
};

export default RecipeDetailsPage;
