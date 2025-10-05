import React from "react";

function Image({
  src,
  alt = "Image",
  className = "",
  ...props
}) {
  // 🧩 Local fallback image (place one in /public/assets/images/no_image.png)
  const localFallback = "/assets/images/no_image.png";

  // 🧩 Online backup fallback (only used if local missing)
  const remoteFallback = "https://dummyimage.com/600x400/e5e7eb/1f2937.png&text=No+Image";

  return (
    <img
      src={src || localFallback}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Fallback order: uploaded image → local fallback → remote fallback
        if (e.target.src !== window.location.origin + localFallback) {
          e.target.src = localFallback;
        } else {
          e.target.src = remoteFallback;
        }
      }}
      {...props}
    />
  );
}

export default Image;