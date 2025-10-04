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

  // 🔹 Fetch recipe + user + favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // ✅ Get recipe
        const res = await axios.get(
          `https://yammiverse.onrender.com/api/recipes/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let recipeData = res.data.recipe || res.data;

        // Normalize image URL
        if (recipeData?.image && !recipeData.image.startsWith("http")) {
          recipeData.image = `https://yammiverse.onrender.com/${recipeData.image.replace(
            /\\/g,
            "/"
          )}`;
        }

        setRecipe(recipeData);

        // ✅ Get current user
        if (token) {
          try {
            const userRes = await axios.get(
              "https://yammiverse.onrender.com/api/users/me",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentUser(userRes.data.user);
          } catch {
            setCurrentUser(null);
          }
        }

        // ✅ Get favorites
        if (token) {
          const favRes = await axios.get(
            "https://yammiverse.onrender.com/api/favorites",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const favorites = favRes.data.favorites || [];
          setIsFavorite(favorites.some((fav) => fav._id === recipeId));
        }
      } catch (err) {
        console.error("❌ Error fetching recipe details:", err);
        setRecipe(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) fetchData();
  }, [recipeId, token]);

  // 🔹 Toggle favorite
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
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    }
  };

  // 🔹 Edit
  const handleEdit = () => {
    navigate(`/edit-recipe/${recipeId}`); // ✅ FIXED route
  };

  // 🔹 Delete
  const handleDelete = () => setIsDeleteModalOpen(true);

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `https://yammiverse.onrender.com/api/recipes/${recipeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(` Recipe ${recipe?.title} deleted`);

      navigate("/home", {
        state: { message: "Recipe deleted successfully!" },
      });
    } catch (err) {
      console.error("❌ Delete failed:", err);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  // 🔹 Loading state
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

  // 🔹 Not found
  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-semibold text-foreground mb-2">
              Recipe Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The recipe you're looking for doesn't exist.
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

  // 🔹 Render Recipe
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

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <IngredientsList ingredients={recipe?.ingredients} />
            </div>
            <div className="lg:col-span-2">
              <InstructionsList instructions={recipe?.instructions} />
            </div>
          </div>

          {/* Nutrition */}
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