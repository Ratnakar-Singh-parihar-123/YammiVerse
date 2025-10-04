import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Components
import TopNavigation from "../../components/ui/TopNavigation";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import AccountSettings from "./components/AccountSettings";

const API_BASE_URL = "https://yammiverse.onrender.com/api"; // 🔹 Backend base URL

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyDigest: false,
    recommendations: true,
    publicProfile: true,
    showStats: true,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  // 🔹 Get token
  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  // =====================================================
  // 📌 Fetch Profile
  // =====================================================
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error.response?.data || error);
      // token clear + redirect
      localStorage.removeItem("recipeHub-token");
      sessionStorage.removeItem("recipeHub-token");
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchUserProfile();
  }, [token, navigate]);

  // =====================================================
  // 📌 Avatar Upload
  // =====================================================
  const handleImageChange = async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await axios.put(`${API_BASE_URL}/users/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUserProfile();
      alert("✅ Profile picture updated!");
    } catch (error) {
      console.error("❌ Image upload failed:", error.response?.data || error);
      alert("❌ Image upload failed. Try again.");
    }
  };

  // =====================================================
  // 📌 Profile Update
  // =====================================================
  const handleProfileSave = async (formData) => {
    try {
      await axios.put(`${API_BASE_URL}/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchUserProfile();
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Profile update failed:", error.response?.data || error);
      alert("❌ Profile update failed. Try again.");
    }
  };

  const handleProfileCancel = () => {
    console.log("Profile edit cancelled");
  };

  // =====================================================
  // 📌 Settings
  // =====================================================
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleLogout = () => {
    localStorage.removeItem("recipeHub-token");
    sessionStorage.removeItem("recipeHub-token");
    navigate("/login", { replace: true });
  };

  // =====================================================
  // 📌 Loading State
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">❌ User not found. Please log in again.</p>
      </div>
    );
  }

  // =====================================================
  // 📌 Render
  // =====================================================
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={user} onImageChange={handleImageChange} />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-border">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Account Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "profile" && (
            <ProfileForm
              user={user}
              onSave={handleProfileSave}
              onCancel={handleProfileCancel}
            />
          )}
          {activeTab === "settings" && (
            <AccountSettings
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Account Info Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-heading font-semibold text-foreground mb-2">
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Member since:</span>
                <span className="ml-2 text-foreground font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Account ID:</span>
                <span className="ml-2 text-foreground font-mono">
                  #{user?._id?.slice(-6)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total recipes:</span>
                <span className="ml-2 text-foreground font-medium">
                  {user?.totalRecipes || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Favorite recipes:</span>
                <span className="ml-2 text-foreground font-medium">
                  {user?.totalFavorites || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;