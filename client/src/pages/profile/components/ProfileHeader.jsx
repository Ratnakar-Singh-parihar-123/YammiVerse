import React, { useState } from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";
import api, { getImageUrl } from "../../../utils/api";
import { updateAuthUser } from "../../../utils/auth";

const ProfileHeader = ({ user, onImageChange }) => {
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Avatar Upload
  const handleImageUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await api.put("/api/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.user) {
        updateAuthUser(res.data.user);
        if (onImageChange) {
          onImageChange(res.data.user);
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(error?.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = getImageUrl(user?.avatar);
  const userInitials = (user?.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 sm:p-8 border shadow-warm-lg bg-card rounded-2xl border-border">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
        {/* Profile Avatar with Camera Overlay */}
        <div
          className="relative cursor-pointer group shrink-0"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <div className="overflow-hidden border-4 rounded-full shadow-md w-28 h-28 sm:w-32 sm:h-32 border-background ring-2 ring-primary/20 bg-muted/40">
            {user?.avatar ? (
              <Image
                src={avatarUrl}
                alt={`${user?.fullName || "User"}'s avatar`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-heading font-bold text-3xl">
                {userInitials}
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
              isImageHovered || uploading ? "opacity-100 bg-black/60" : "opacity-0"
            }`}
          >
            {uploading ? (
              <Icon
                name="Loader2"
                size={28}
                className="text-white animate-spin"
              />
            ) : (
              <>
                <Icon name="Camera" size={24} className="text-white mb-1" />
                <span className="text-[10px] text-white font-medium">Change</span>
              </>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload profile avatar"
            title="Click to change profile picture"
          />
        </div>

        {/* User Info Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground truncate">
              {user?.fullName || "Anonymous Chef"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20 self-center sm:self-auto">
              <Icon name="ChefHat" size={14} />
              <span>YammiVerse Member</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-3 truncate">
            {user?.email}
          </p>

          {/* Bio */}
          <p className="text-sm text-foreground/90 italic mb-4 max-w-xl leading-relaxed">
            {user?.bio || "No bio added yet. Tell the YammiVerse community about your favorite cuisines!"}
          </p>

          {/* Location & Website */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-muted-foreground mb-6">
            {user?.location && (
              <div className="flex items-center gap-1.5">
                <Icon name="MapPin" size={15} className="text-primary" />
                <span>{user.location}</span>
              </div>
            )}
            {user?.website && (
              <div className="flex items-center gap-1.5">
                <Icon name="Globe" size={15} className="text-primary" />
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>

          {/* Account Stats Counter */}
          <div className="flex items-center justify-center sm:justify-start gap-8 pt-4 border-t border-border/70">
            <div>
              <div className="text-2xl font-bold font-heading text-foreground">
                {user?.totalRecipes ?? 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Recipes
              </div>
            </div>
            <div className="h-8 w-[1px] bg-border/80" />
            <div>
              <div className="text-2xl font-bold font-heading text-foreground">
                {user?.totalFavorites ?? 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Favorites
              </div>
            </div>
            <div className="h-8 w-[1px] bg-border/80" />
            <div>
              <div className="text-2xl font-bold font-heading text-foreground">
                {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2026"}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Joined
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
