import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TopNavigation from "../../components/ui/TopNavigation";
import RecipeHeader from "./components/RecipeHeader";
import IngredientsList from "./components/IngredientsList";
import InstructionsList from "./components/InstructionsList";
import NutritionInfo from "./components/NutritionInfo";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

const RecipeDetailsPage = () => {
  const navigate = useNavigate();
  const { id: recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  // ✅ Fetch Recipe, User, and Favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch recipe details
        const recipeRes = await axios.get(
          `https://yammiverse.onrender.com/api/recipes/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let recipeData = recipeRes.data.recipe || recipeRes.data;

        // Normalize image (support local + cloudinary)
        if (recipeData?.coverImage || recipeData?.image) {
          let imageUrl = recipeData.coverImage || recipeData.image;
          if (!imageUrl.startsWith("http")) {
            imageUrl = `https://yammiverse.onrender.com${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
          }
          recipeData.image = imageUrl;
        } else {
          recipeData.image = "https://via.placeholder.com/600x400?text=No+Image";
        }

        setRecipe(recipeData);

        // Fetch current user
        const userRes = await axios.get(
          "https://yammiverse.onrender.com/api/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(userRes.data.user);

        // Fetch favorites
        const favRes = await axios.get(
          "https://yammiverse.onrender.com/api/favorites",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const favorites = favRes.data.favorites || [];
        // ✅ Fix: match recipe._id correctly
        setIsFavorite(favorites.some((fav) => fav.recipe?._id === recipeId));
      } catch (error) {
        console.error("❌ Error fetching recipe details:", error);
        setRecipe(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId && token) fetchData();
  }, [recipeId, token]);

  // ✅ Toggle Favorite
  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(
          `https://yammiverse.onrender.com/api/favorites/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(false);
      } else {
        await axios.post(
          `https://yammiverse.onrender.com/api/favorites/${recipeId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("❌ Favorite toggle failed:", error);
    }
  };

  // ✅ Edit / Delete Handlers
  const handleEdit = () => navigate(`/edit-recipe/${recipeId}`);
  const handleDelete = () => setIsDeleteModalOpen(true);
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `https://yammiverse.onrender.com/api/recipes/${recipeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/home", {
        state: { message: "Recipe deleted successfully!" },
      });
    } catch (error) {
      console.error("❌ Delete failed:", error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Not Found
  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
              Recipe Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The recipe you're looking for doesn't exist or was removed.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main Recipe Render
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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

          {/* Ingredients + Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <IngredientsList ingredients={recipe?.ingredients} />
            </div>
            <div className="lg:col-span-2">
              <InstructionsList instructions={recipe?.instructions} />
            </div>
          </div>

          {/* Optional Nutrition Section */}
          {recipe?.nutrition && <NutritionInfo nutrition={recipe.nutrition} />}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
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