import React from "react";

function AppImage({
  src,
  alt = "Image",
  className = "",
  ...props
}) {
  // ✅ Local + Cloudinary-safe fallback
  const fallbackImage = "/assets/images/no_image.png";

  // ✅ Error handler (prevents infinite loop)
  const handleError = (e) => {
    if (e.target.src !== fallbackImage) {
      e.target.onerror = null; // prevent re-trigger
      e.target.src = fallbackImage;
    }
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