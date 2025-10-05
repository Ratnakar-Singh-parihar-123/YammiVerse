import React from "react";

function AppImage({
  src,
  alt = "Image",
  className = "",
  ...props
}) {
  // ✅ Reliable global fallback (works everywhere)
  const fallbackImage = "https://placehold.co/600x400/e5e7eb/1f2937?text=No+Image";

  // ✅ Ensure correct rendering
  const handleError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = fallbackImage;
  };

  return (
    <img
      src={src || fallbackImage}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
}

export default AppImage;