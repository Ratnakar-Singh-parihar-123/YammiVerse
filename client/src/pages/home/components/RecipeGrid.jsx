import React from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";

const RecipeGrid = ({
  recipes,
  favorites,
  onToggleFavorite,
  currentUser,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading delicious recipes...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-lg font-semibold text-destructive">
          Oops! Something went wrong
        </h3>
        <p className="text-muted-foreground">
          We couldn't load the recipes. Please try again later.
        </p>
      </div>
    );

  if (!recipes || recipes.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          No recipes found
        </h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search terms or filters to find more recipes.
        </p>
        <Link
          to="/add-recipe"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
        >
          Add Your First Recipe
        </Link>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => {
        const isOwner = recipe?.createdBy?._id === currentUser?._id;

        // ✅ Image normalization
        let imageUrl = recipe?.coverImage || recipe?.image || "";
        const baseUrl = "https://yammiverse.onrender.com";

        if (imageUrl && !imageUrl.startsWith("http")) {
          // remove leading slash if present
          imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
        }

        if (!imageUrl)
          imageUrl = "https://via.placeholder.com/400x300?text=No+Image";

        return (
          <div
            key={recipe?._id}
            onClick={() => navigate(`/recipes/${recipe?._id}`)}
            className="bg-card border border-border rounded-lg shadow-sm overflow-hidden group flex flex-col hover:shadow-lg transition cursor-pointer"
          >
            {/* ✅ Recipe Image */}
            <img
              src={imageUrl}
              alt={recipe?.title}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/400x300?text=Image+Not+Found")
              }
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                {recipe?.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {recipe?.description || "No description provided."}
              </p>

              <div className="mt-auto flex items-center justify-between">
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-recipe/${recipe?._id}`);
                      }}
                      className="px-3 py-1 text-sm border rounded hover:bg-muted transition"
                    >
                      Edit
                    </button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this recipe?"
                          )
                        ) {
                          try {
                            const token =
                              localStorage.getItem("recipeHub-token");
                            await fetch(
                              `https://yammiverse.onrender.com/api/recipes/${recipe?._id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );
                            window.location.reload();
                          } catch (err) {
                            alert("Failed to delete recipe");
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecipeGrid;