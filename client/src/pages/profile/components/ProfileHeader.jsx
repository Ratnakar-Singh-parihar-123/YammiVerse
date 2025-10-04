import React, { useState } from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";
import axios from "axios";

const ProfileHeader = ({ user, onImageChange }) => {
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ Token fix (localStorage + sessionStorage check)
  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  // ✅ Avatar Upload
  const handleImageUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file); // ✅ field name backend ke sath match hona chahiye

    try {
      setUploading(true);

      // 🔥 Use POST instead of PUT for file upload
      const res = await axios.post(
        "https://yammiverse.onrender.com/api/users/me/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Axios khud Content-Type: multipart/form-data set karega
          },
        }
      );

      if (res.data?.user?.avatar) {
        onImageChange(res.data.user.avatar); // ✅ parent ko update karo
      }

      alert("✅ Profile picture updated!");
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      alert(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Avatar URL normalize (backend path → full URL)
  let avatarUrl = user?.avatar
    ? user?.avatar.startsWith("http")
      ? user.avatar
      : `https://yammiverse.onrender.com/${user.avatar.replace(/\\/g, "/")}`
    : "/default-avatar.png";

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
        {/* Profile Image */}
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-border shadow-md">
            <Image
              src={avatarUrl}
              alt={`${user?.fullName || "User"}'s profile picture`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlay */}
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
              isImageHovered ? "opacity-100 bg-black/50" : "opacity-0"
            }`}
          >
            {uploading ? (
              <Icon
                name="Loader2"
                size={28}
                className="animate-spin text-white"
              />
            ) : (
              <Icon name="Camera" size={26} color="white" />
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload profile picture"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-1">
            {user?.fullName || "Anonymous User"}
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            {user?.email || "No email available"}
          </p>

          {/* Bio */}
          <p className="text-foreground/90 mb-3 italic">
            {user?.bio || "No bio added yet."}
          </p>

          {/* Extra Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-muted-foreground mb-6 space-y-2 sm:space-y-0">
            {user?.location && (
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Icon name="MapPin" size={16} />
                <span>{user.location}</span>
              </div>
            )}
            {user?.website && (
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Icon name="Globe" size={16} />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="flex justify-center sm:justify-start space-x-8">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">
                {user?.totalRecipes || 0}
              </div>
              <div className="text-xs text-muted-foreground">Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">
                {user?.totalFavorites || 0}
              </div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Member Since</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;