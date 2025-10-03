import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const IngredientsSection = ({ ingredients, onIngredientsChange, error }) => {
  const addIngredient = () => {
    const newIngredients = [
      ...ingredients,
      { id: Date.now(), name: '', quantity: '', unit: '' },
    ];
    onIngredientsChange(newIngredients);
  };

  const removeIngredient = (id) => {
    const newIngredients = ingredients?.filter(
      (ingredient) => ingredient?.id !== id
    );
    onIngredientsChange(newIngredients);
  };

  const updateIngredient = (id, field, value) => {
    const newIngredients = ingredients?.map((ingredient) =>
      ingredient?.id === id ? { ...ingredient, [field]: value } : ingredient
    );
    onIngredientsChange(newIngredients);
  };

  const unitOptions = [
    'cup',
    'cups',
    'tbsp',
    'tsp',
    'oz',
    'lb',
    'g',
    'kg',
    'ml',
    'l',
    'piece',
    'pieces',
    'clove',
    'cloves',
    'custom', //  Extra option for free text
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Ingredients *
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

      <div className="space-y-3">
        {ingredients?.map((ingredient) => (
          <div
            key={ingredient?.id}
            className="flex items-start space-x-3 p-4 bg-card rounded-lg border border-border"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Ingredient Name */}
              <div className="md:col-span-6">
                <Input
                  type="text"
                  placeholder="e.g., All-purpose flour"
                  value={ingredient?.name}
                  onChange={(e) =>
                    updateIngredient(ingredient?.id, 'name', e?.target?.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Quantity */}
              <div className="md:col-span-3">
                <Input
                  type="text"
                  placeholder="200"
                  value={ingredient?.quantity}
                  onChange={(e) =>
                    updateIngredient(ingredient?.id, 'quantity', e?.target?.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Unit */}
              <div className="md:col-span-3">
                {ingredient?.unit === 'custom' ? (
                  <Input
                    type="text"
                    placeholder="e.g., g, slices, pinch"
                    value={ingredient?.customUnit || ''}
                    onChange={(e) =>
                      updateIngredient(ingredient?.id, 'customUnit', e?.target?.value)
                    }
                    className="w-full"
                  />
                ) : (
                  <select
                    value={ingredient?.unit}
                    onChange={(e) =>
                      updateIngredient(ingredient?.id, 'unit', e?.target?.value)
                    }
                    className="w-full h-10 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="">Unit</option>
                    {unitOptions?.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeIngredient(ingredient?.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        ))}
      </div>

      {ingredients?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Plus" size={24} className="mx-auto mb-2 opacity-50" />
          <p>No ingredients added yet. Click "Add Ingredient" to get started.</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default IngredientsSection;