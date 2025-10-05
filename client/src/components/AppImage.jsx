import React from "react";

function AppImage({ src, alt = "Image", className = "", ...props }) {
  // ✅ Local + CDN fallback chain
  const localFallback = "/assets/images/no_image.png";
  const cdnFallback = "https://placehold.co/600x400/e5e7eb/1f2937?text=No+Image";

  // ✅ Normalize image URL (Cloudinary, backend, or local)
  const getSafeSrc = (url) => {
    if (!url) return localFallback;

    // If already a full Cloudinary or external URL
    if (url.startsWith("http")) return url;

    // If backend-relative path (e.g. /uploads/recipe.jpg)
    const baseUrl = "https://yammiverse.onrender.com";
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const safeSrc = getSafeSrc(src);

  // ✅ Prevent infinite error loop
  const handleError = (e) => {
    if (!e.target.dataset.fallbackTried) {
      e.target.src = localFallback;
      e.target.dataset.fallbackTried = "true";
    } else {
      e.target.src = cdnFallback;
    }
  };

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
}

export default AppImage;