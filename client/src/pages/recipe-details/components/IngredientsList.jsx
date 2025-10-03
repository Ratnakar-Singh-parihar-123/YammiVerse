import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";

const IngredientsList = ({ ingredients = [] }) => {
  const navigate = useNavigate();

  const handleAddToShoppingList = () => {
    const savedList = JSON.parse(localStorage.getItem("shopping-list") || "[]");

    //  Prevent duplicates
    const updatedList = [
      ...savedList,
      ...ingredients.filter(
        (ing) => !savedList.find((item) => item.name === ing.name)
      ),
    ];

    localStorage.setItem("shopping-list", JSON.stringify(updatedList));

    //  Redirect to ShoppingList page
    navigate("/shhopinglist");
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="ShoppingCart" size={22} color="var(--color-primary)" />
        <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
      </div>

      {/* Ingredients List */}
      {ingredients?.length > 0 ? (
        <ul className="space-y-3">
          {ingredients.map((ing, i) => {
            //  Support custom unit
            const unit =
              ing.unit === "custom" ? ing.customUnit || "" : ing.unit || "";

            return (
              <li
                key={i}
                className="flex items-center justify-between p-3 rounded-md bg-muted/40 hover:bg-muted transition"
              >
                <span className="text-foreground font-medium">{ing.name}</span>

                {/*  Show quantity + unit */}
                <span className="text-muted-foreground font-medium">
                  {ing.quantity
                    ? `${ing.quantity}${unit ? " " + unit : ""}`
                    : unit}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-4">
          No ingredients available.
        </p>
      )}

      {/* Add to Shopping List Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <button
          onClick={handleAddToShoppingList}
          className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-md hover:bg-primary/90 transition"
        >
          <Icon name="Plus" size={18} />
          <span className="font-medium">Add to Shopping List</span>
        </button>
      </div>
    </div>
  );
};

export default IngredientsList;