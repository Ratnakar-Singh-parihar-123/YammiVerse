import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopNavigation from "../../components/ui/TopNavigation";
import Input from "../../components/ui/Input";
import RecipeImageUpload from "./components/RecipeImageUpload";
import IngredientsSection from "./components/IngredientsSection";
import InstructionsSection from "./components/InstructionsSection";
import RecipeFormActions from "./components/RecipeFormActions";
import Icon from "../../components/AppIcon";

const AddRecipe = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  //  Form state (cookingTime → time)
  const [formData, setFormData] = useState({
    title: "",
    time: "", //  fixed field
    servings: "",
    difficulty: "medium",
    category: "",
    description: "",
    image: null,
  });

  const [ingredients, setIngredients] = useState([
    { id: 1, name: "", quantity: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState([
    { id: 1, step: 1, text: "" },
  ]);
  const [errors, setErrors] = useState({});

  //  Track unsaved changes
  useEffect(() => {
    const hasChanges =
      formData?.title?.trim() !== "" ||
      formData?.time?.trim() !== "" ||
      formData?.servings?.trim() !== "" ||
      formData?.category?.trim() !== "" ||
      formData?.description?.trim() !== "" ||
      formData?.image !== null ||
      ingredients?.some(
        (ing) =>
          ing?.name?.trim() !== "" ||
          ing?.quantity?.trim() !== "" ||
          ing?.unit?.trim() !== ""
      ) ||
      instructions?.some((inst) => inst?.text?.trim() !== "");
    setHasUnsavedChanges(hasChanges);
  }, [formData, ingredients, instructions]);

  //  Input handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //  Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData?.title?.trim()) newErrors.title = "Recipe title is required";
    if (!formData?.time?.trim()) newErrors.time = "Cooking time is required";
    if (!formData?.servings?.trim())
      newErrors.servings = "Number of servings is required";
    if (!formData?.category?.trim())
      newErrors.category = "Recipe category is required";

    const validIngredients = ingredients.filter(
      (ing) => ing?.name?.trim() !== "" && ing?.quantity?.trim() !== ""
    );
    if (validIngredients.length === 0)
      newErrors.ingredients = "At least one ingredient is required";

    const validInstructions = instructions.filter(
      (inst) => inst?.text?.trim() !== ""
    );
    if (validInstructions.length === 0)
      newErrors.instructions = "At least one instruction step is required";

    if (
      formData?.time?.trim() &&
      !/^\d+\s*(min|mins|minutes?|hr|hrs|hours?|h)$/i.test(
        formData?.time?.trim()
      )
    ) {
      newErrors.time = 'Please use format like "30 mins" or "1 hour"';
    }

    if (
      formData?.servings?.trim() &&
      (isNaN(formData?.servings) || parseInt(formData?.servings) < 1)
    ) {
      newErrors.servings = "Servings must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //  Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const validIngredients = ingredients.filter(
        (ing) => ing?.name?.trim() !== "" && ing?.quantity?.trim() !== ""
      );
      const validInstructions = instructions.filter(
        (inst) => inst?.text?.trim() !== ""
      );

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("time", formData.time); //  fixed
      formDataToSend.append("servings", formData.servings);
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image); //  backend route expects "image"
      }

      formDataToSend.append("ingredients", JSON.stringify(validIngredients));
      formDataToSend.append("instructions", JSON.stringify(validInstructions));

      const token =
        localStorage.getItem("recipeHub-token") ||
        sessionStorage.getItem("recipeHub-token");

      await axios.post("http://localhost:5000/api/recipes", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/home", { state: { message: "Recipe created successfully!" } });
    } catch (error) {
      console.error("Error saving recipe:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to save recipe. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  //  Options
  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const categoryOptions = [
    "Appetizer",
    "Main Course",
    "Dessert",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Beverage",
    "Soup",
    "Salad",
    "Side Dish",
    "Vegetarian",
    "Vegan",
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Plus" size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Add New Recipe
            </h1>
          </div>
          <p className="text-muted-foreground">
            Share your culinary creation with the RecipeHub community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold text-foreground flex items-center space-x-2">
              <Icon name="Info" size={20} />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Recipe Title"
                  type="text"
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  value={formData?.title}
                  onChange={(e) => handleInputChange("title", e?.target?.value)}
                  error={errors?.title}
                  required
                />
              </div>

              <Input
                label="Cooking Time"
                type="text"
                placeholder="e.g., 45 mins"
                value={formData?.time} //  fixed
                onChange={(e) => handleInputChange("time", e?.target?.value)}
                error={errors?.time}
                description="Include prep and cook time"
                required
              />

              <Input
                label="Servings"
                type="number"
                placeholder="4"
                value={formData?.servings}
                onChange={(e) =>
                  handleInputChange("servings", e?.target?.value)
                }
                error={errors?.servings}
                min="1"
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty Level *
                </label>
                <select
                  value={formData?.difficulty}
                  onChange={(e) =>
                    handleInputChange("difficulty", e?.target?.value)
                  }
                  className="w-full h-10 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {difficultyOptions?.map((option) => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  value={formData?.category}
                  onChange={(e) =>
                    handleInputChange("category", e?.target?.value)
                  }
                  className="w-full h-10 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categoryOptions?.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors?.category && (
                  <p className="text-sm text-destructive mt-1">
                    {errors?.category}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of your recipe..."
                  value={formData?.description}
                  onChange={(e) =>
                    handleInputChange("description", e?.target?.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Recipe Image */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground flex items-center space-x-2 mb-6">
              <Icon name="Camera" size={20} />
              <span>Recipe Photo</span>
            </h2>
            <RecipeImageUpload
              image={formData?.image}
              onImageChange={(file) => handleInputChange("image", file)}
              error={errors?.image}
            />
          </div>

          {/* Ingredients */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground flex items-center space-x-2 mb-6">
              <Icon name="ShoppingCart" size={20} />
              <span>Ingredients</span>
            </h2>
            <IngredientsSection
              ingredients={ingredients}
              onIngredientsChange={setIngredients}
              error={errors?.ingredients}
            />
          </div>

          {/* Instructions */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground flex items-center space-x-2 mb-6">
              <Icon name="List" size={20} />
              <span>Instructions</span>
            </h2>
            <InstructionsSection
              instructions={instructions}
              onInstructionsChange={setInstructions}
              error={errors?.instructions}
            />
          </div>

          {/* Form Actions */}
          <div className="bg-card rounded-lg border border-border p-6">
            {errors?.submit && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{errors?.submit}</p>
              </div>
            )}
            <RecipeFormActions
              onSave={handleSave}
              onCancel={() => navigate("/home")}
              isLoading={isLoading}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddRecipe;