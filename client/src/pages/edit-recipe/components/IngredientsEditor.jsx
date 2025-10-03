import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const IngredientsEditor = ({ ingredients, onIngredientsChange, error }) => {
  const addIngredient = () => {
    const newIngredients = [
      ...ingredients,
      { id: Date.now(), quantity: '', unit: '', name: '' }, //  amount → quantity
    ];
    onIngredientsChange(newIngredients);
  };

  const removeIngredient = (id) => {
    const filtered = ingredients.filter((ing) => (ing.id || ing._id) !== id);
    onIngredientsChange(filtered);
  };

  const updateIngredient = (id, field, value) => {
    const updated = ingredients.map((ing) =>
      (ing.id || ing._id) === id ? { ...ing, [field]: value } : ing
    );
    onIngredientsChange(updated);
  };

  const moveIngredient = (index, direction) => {
    const newIngredients = [...ingredients];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < ingredients.length) {
      [newIngredients[index], newIngredients[targetIndex]] = [
        newIngredients[targetIndex],
        newIngredients[index],
      ];
      onIngredientsChange(newIngredients);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Ingredients
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
        >
          Add Ingredient
        </Button>
      </div>

      {/* Ingredient List */}
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => {
          const key = ingredient.id || ingredient._id || index;
          return (
            <div
              key={key}
              className="flex items-center space-x-2 p-4 bg-card rounded-lg border border-border"
            >
              {/* Move Controls */}
              <div className="flex flex-col space-y-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => moveIngredient(index, 'up')}
                  disabled={index === 0}
                  iconName="ChevronUp"
                  iconSize={14}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => moveIngredient(index, 'down')}
                  disabled={index === ingredients.length - 1}
                  iconName="ChevronDown"
                  iconSize={14}
                />
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  type="text"
                  placeholder="Quantity"
                  aria-label="Ingredient quantity"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    updateIngredient(key, 'quantity', e.target.value)
                  }
                  className="w-full"
                  required
                />
                <Input
                  type="text"
                  placeholder="Unit"
                  aria-label="Ingredient unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(key, 'unit', e.target.value)}
                  className="w-full"
                />
                <Input
                  type="text"
                  placeholder="Ingredient name"
                  aria-label="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(key, 'name', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Remove */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(key)}
                iconName="Trash2"
                iconSize={16}
                className="text-destructive hover:text-destructive"
              />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {ingredients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="ChefHat" size={48} className="mx-auto mb-2 opacity-50" />
          <p>No ingredients added yet</p>
          <p className="text-sm">Click "Add Ingredient" to get started</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default IngredientsEditor;