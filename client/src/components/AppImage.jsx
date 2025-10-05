import React from "react";

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  const fallbackImage = "https://placehold.co/600x400?text=No+Image&font=inter";

  return (
    <img
      src={src || fallbackImage}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.target.src = fallbackImage;
      }}
      {...props}
    />
  );
}

export default Image;