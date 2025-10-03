import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const NutritionInfo = ({ nutrition = {}, onNutritionLoad }) => {
  const nutritionItems = [
    { label: 'Calories', key: 'calories', unit: 'kcal', icon: 'Zap' },
    { label: 'Protein', key: 'protein', unit: 'g', icon: 'Beef' },
    { label: 'Carbs', key: 'carbs', unit: 'g', icon: 'Wheat' },
    { label: 'Fat', key: 'fat', unit: 'g', icon: 'Droplet' },
    { label: 'Fiber', key: 'fiber', unit: 'g', icon: 'Leaf' },
    { label: 'Sugar', key: 'sugar', unit: 'g', icon: 'Candy' },
  ];

  // 🔄 Agar parent ko data bhejna ho
  useEffect(() => {
    if (onNutritionLoad && nutrition) {
      onNutritionLoad(nutrition);
    }
  }, [nutrition, onNutritionLoad]);

  return (
    <div className="bg-card rounded-lg shadow-warm p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Activity" size={24} color="var(--color-primary)" />
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Nutrition Information
        </h2>
        <span className="text-sm text-muted-foreground ml-2">per serving</span>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nutritionItems
          .filter((item) => nutrition?.[item.key] !== undefined) // sirf available items
          .map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-background rounded-lg border border-border hover:border-primary/20 transition-micro"
              aria-label={`${item.label}: ${nutrition?.[item.key]} ${item.unit}`}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2">
                <Icon name={item.icon} size={20} color="var(--color-primary)" />
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {nutrition?.[item.key] ?? '--'}
                  <span className="text-sm text-muted-foreground ml-1">
                    {item.unit}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Info Note */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Nutritional values are approximate and may vary based on specific
          ingredients and preparation methods.
        </p>
      </div>
    </div>
  );
};

export default NutritionInfo;