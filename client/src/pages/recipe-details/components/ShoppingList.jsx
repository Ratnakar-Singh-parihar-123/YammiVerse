import React, { useEffect, useState } from "react";
import Icon from "../../../components/AppIcon";

const ShoppingList = () => {
  const [shoppingItems, setShoppingItems] = useState([]);

  //  Load from localStorage
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("shopping-list") || "[]");
    setShoppingItems(savedItems);
  }, []);

  const handleRemoveItem = (name) => {
    const updated = shoppingItems.filter((item) => item.name !== name);
    setShoppingItems(updated);
    localStorage.setItem("shopping-list", JSON.stringify(updated)); //  Update storage
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Icon name="ShoppingCart" size={24} /> Shopping List
      </h1>

      {shoppingItems.length === 0 ? (
        <p className="text-muted-foreground">Your shopping list is empty.</p>
      ) : (
        <ul className="space-y-3">
          {shoppingItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-3 rounded-md bg-card border border-border"
            >
              <span>
                {item.amount ? `${item.amount} ${item.unit || ""}` : ""} {item.name}
              </span>
              <button
                onClick={() => handleRemoveItem(item.name)}
                className="text-destructive hover:text-destructive/80"
              >
                <Icon name="Trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShoppingList;