import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TopNavigation from "../../components/ui/TopNavigation";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import EditRecipeForm from "./components/EditRecipeForm";

const EditRecipe = () => {
  const navigate = useNavigate();
  const { id: recipeId } = useParams();

  const [recipeData, setRecipeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch recipe
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const token =
          localStorage.getItem("recipeHub-token") ||
          sessionStorage.getItem("recipeHub-token");

        const res = await axios.get(
          `https://yammiverse.onrender.com/api/recipes/${recipeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRecipeData(res.data.recipe);
      } catch (err) {
        console.error("❌ Failed to fetch recipe:", err);
        setRecipeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) fetchRecipe();
  }, [recipeId]);

  // 🔹 Save handler
  const handleSaveRecipe = async (updatedRecipe) => {
    try {
      const token =
        localStorage.getItem("recipeHub-token") ||
        sessionStorage.getItem("recipeHub-token");

      //  Convert to FormData
      const formDataToSend = new FormData();
      formDataToSend.append("title", updatedRecipe.title || "");
      formDataToSend.append("cookingTime", updatedRecipe.cookingTime || "");
      formDataToSend.append("servings", updatedRecipe.servings || 1);
      formDataToSend.append("difficulty", updatedRecipe.difficulty || "medium");
      formDataToSend.append("category", updatedRecipe.category || "");
      formDataToSend.append("description", updatedRecipe.description || "");

      if (updatedRecipe.image instanceof File) {
        formDataToSend.append("image", updatedRecipe.image);
      }

      // Ingredients + Instructions ko stringify karna hoga
      formDataToSend.append(
        "ingredients",
        JSON.stringify(updatedRecipe.ingredients || [])
      );
      formDataToSend.append(
        "instructions",
        JSON.stringify(updatedRecipe.instructions || [])
      );

      const res = await axios.put(
        `https://yammiverse.onrender.com/api/recipes/${recipeId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecipeData(res.data.recipe);
      return res.data.recipe;
    } catch (err) {
      console.error("❌ Failed to save recipe:", err);
      throw err;
    }
  };

  const handleCancel = () => {
    navigate(`/recipes/${recipeId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // 🔹 Loading
  if (isLoading) {
    return (
      <>
        <TopNavigation />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading recipe data...</p>
          </div>
        </div>
      </>
    );
  }

  // 🔹 Not Found
  if (!recipeData) {
    return (
      <>
        <TopNavigation />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto mt-16">
            <Icon
              name="AlertCircle"
              size={64}
              className="mx-auto text-muted-foreground"
            />
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Recipe Not Found
            </h1>
            <p className="text-muted-foreground">
              The recipe you're trying to edit could not be found.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleGoBack}
                iconName="ArrowLeft"
                iconPosition="left"
                iconSize={16}
              >
                Go Back
              </Button>
              <Button
                variant="default"
                onClick={() => navigate("/home")}
                iconName="Home"
                iconPosition="left"
                iconSize={16}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 🔹 Render page
  return (
    <>
      <TopNavigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                iconName="ArrowLeft"
                iconPosition="left"
                iconSize={16}
              >
                Back
              </Button>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Edit Recipe
              </h1>
              <p className="text-muted-foreground">
                Make changes to your recipe and save them to update your
                collection.
              </p>
            </div>
          </div>

          {/* Current Recipe Info */}
          <div className="mb-8 p-6 bg-card rounded-lg border border-border">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Icon name="Edit3" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground">
                  Currently Editing: {recipeData?.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date(recipeData.updatedAt)?.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
            <EditRecipeForm
              recipeData={recipeData}
              onSave={handleSaveRecipe}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditRecipe;