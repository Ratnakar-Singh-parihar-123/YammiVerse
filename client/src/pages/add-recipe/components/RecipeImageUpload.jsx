import React, { useState } from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const RecipeImageUpload = ({ image, onImageChange, error }) => {
  const [dragActive, setDragActive] = useState(false);

  // ✅ Handle drag and drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageChange(file); // ✅ Send File object (not Base64)
      } else {
        alert("Please upload a valid image file (JPG, PNG, or WEBP)");
      }
    }
  };

  // ✅ Handle file input
  const handleFileInput = (e) => {
    const file = e.target?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageChange(file);
    } else if (file) {
      alert("Only image files are allowed (JPG, PNG, WEBP).");
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Recipe Image
      </label>

      {/* ✅ If Image Selected */}
      {image ? (
        <div className="relative">
          <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
            <Image
              src={image instanceof File ? URL.createObjectURL(image) : image}
              alt="Recipe preview"
              className="w-full h-full object-cover"
            />
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2"
            iconName="X"
            iconSize={16}
          >
            Remove
          </Button>
        </div>
      ) : (
        // ✅ Upload Drop Zone
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-micro ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Icon
                  name="ImagePlus"
                  size={32}
                  className="text-muted-foreground"
                />
              </div>
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG, WEBP — up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Error Message */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default RecipeImageUpload;