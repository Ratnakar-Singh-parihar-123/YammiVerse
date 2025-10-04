import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import RecipeImageUpload from './RecipeImageUpload';
import IngredientsEditor from './IngredientsEditor';
import InstructionsEditor from './InstructionsEditor';

const EditRecipeForm = ({ recipeData, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    cookingTime: '',
    servings: '',
    difficulty: 'medium',
    category: '',
    description: '',
    image: null, // File ya URL dono ho sakta hai
  });

  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  //  Load recipe data
  useEffect(() => {
    if (recipeData) {
      setFormData({
        title: recipeData?.title || '',
        cookingTime: recipeData?.cookingTime || '',
        servings: recipeData?.servings || '',
        difficulty: recipeData?.difficulty || 'medium',
        category: recipeData?.category || '',
        description: recipeData?.description || '',
        image: recipeData?.coverImage || recipeData?.image || null,
      });
      setIngredients(recipeData?.ingredients || []);
      setInstructions(recipeData?.instructions || []);
    }
  }, [recipeData]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData, ingredients, instructions]);

  //  Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors?.[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  //  Handle Image Change
  const handleImageChange = (fileOrUrl) => {
    setFormData((prev) => ({ ...prev, image: fileOrUrl }));
  };

  //  Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) newErrors.title = 'Recipe title is required';
    if (!formData?.cookingTime?.trim())
      newErrors.cookingTime = 'Cooking time is required';

    if (!String(formData?.servings || '').trim())
      newErrors.servings = 'Number of servings is required';

    if (!formData?.category?.trim())
      newErrors.category = 'Recipe category is required';

    if (!ingredients?.length)
      newErrors.ingredients = 'At least one ingredient is required';
    if (ingredients?.some((ing) => !ing?.name?.trim()))
      newErrors.ingredients = 'All ingredients must have a name';

    if (!instructions?.length)
      newErrors.instructions = 'At least one instruction step is required';
    if (instructions?.some((inst) => !inst?.text?.trim()))
      newErrors.instructions = 'All instruction steps must have text';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //  Submit Handler
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const recipeId = recipeData?._id || recipeData?.id;
      if (!recipeId) {
        console.error('⚠️ RecipeData missing ID:', recipeData);
        throw new Error('Recipe ID is missing, cannot update.');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('cookingTime', formData.cookingTime);
      data.append('servings', formData.servings);
      data.append('difficulty', formData.difficulty);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('ingredients', JSON.stringify(ingredients));
      data.append('instructions', JSON.stringify(instructions));

      //  Image handle
      if (formData.image && formData.image instanceof File) {
        data.append('image', formData.image);
      } else if (typeof formData.image === 'string') {
        data.append('coverImage', formData.image);
      }

      const token = localStorage.getItem('recipeHub-token');
      const res = await fetch(`https://yammiverse.onrender.com/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.message || 'Failed to update recipe');

      const updatedRecipe = response.recipe || response;
      await onSave(updatedRecipe);

      setHasUnsavedChanges(false);
      navigate(`/recipes/${updatedRecipe._id || updatedRecipe.id}`);
    } catch (error) {
      console.error('❌ Error updating recipe:', error);
      setErrors({
        submit: error.message || 'Failed to update recipe. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //  Cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    onCancel();
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="Recipe Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
          />
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            error={errors.category}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Cooking Time"
            name="cookingTime"
            value={formData.cookingTime}
            onChange={handleInputChange}
            error={errors.cookingTime}
            required
          />
          <Input
            label="Servings"
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleInputChange}
            error={errors.servings}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {difficultyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Brief description..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      </div>

      {/* Image Upload */}
      <div>
        <h2 className="text-xl font-heading font-semibold mb-4">Recipe Image</h2>
        <RecipeImageUpload
          currentImage={formData.image}
          onImageChange={handleImageChange}
          error={errors.image}
        />
      </div>

      {/* Ingredients */}
      <div>
        <h2 className="text-xl font-heading font-semibold mb-4">Ingredients</h2>
        <IngredientsEditor
          ingredients={ingredients}
          onIngredientsChange={setIngredients}
          error={errors.ingredients}
        />
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-xl font-heading font-semibold mb-4">Instructions</h2>
        <InstructionsEditor
          instructions={instructions}
          onInstructionsChange={setInstructions}
          error={errors.instructions}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        {errors.submit && (
          <p className="text-sm text-destructive">{errors.submit}</p>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            iconName="Save"
            iconPosition="left"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditRecipeForm;