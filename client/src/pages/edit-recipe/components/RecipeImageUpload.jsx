import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecipeImageUpload = ({ currentImage, onImageChange, error }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  //  If currentImage is string (from DB), show directly
  useEffect(() => {
    if (typeof currentImage === "string") {
      setPreviewImage(currentImage.startsWith("http") 
        ? currentImage 
        : `https://yammiverse.onrender.com/${currentImage.replace(/\\/g, "/")}`);
    }
  }, [currentImage]);

  const handleImageUpload = (file) => {
    if (file && file.type?.startsWith("image/")) {
      setPreviewImage(URL.createObjectURL(file)); //  show preview
      onImageChange(file); //  send actual File object to parent
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e?.dataTransfer?.files?.[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Recipe Image
      </label>

      {previewImage ? (
        <div className="relative">
          <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
            <Image
              src={previewImage}
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
        <div
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-4 transition-micro cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary hover:bg-muted"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <div className="flex flex-col items-center space-y-2">
            <Icon name="ImagePlus" size={48} className="text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default RecipeImageUpload;