import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopNavigation from "../../components/ui/TopNavigation";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import AccountSettings from "./components/AccountSettings";
import api from "../../utils/api";
import {
  getAuthToken,
  getAuthUser,
  updateAuthUser,
  clearAuthSession,
} from "../../utils/auth";
import Icon from "../../components/AppIcon";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getAuthUser());
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyDigest: false,
    recommendations: true,
    publicProfile: true,
    showStats: true,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const token = getAuthToken();

  // Fetch Profile (with stats)
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users/profile");
      if (res.data?.user) {
        setUser(res.data.user);
        updateAuthUser(res.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error.response?.data || error);
      clearAuthSession();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserProfile();
  }, [token, navigate, fetchUserProfile]);

  // Avatar changed by ProfileHeader
  const handleAvatarUpdated = (updatedUser) => {
    setUser(updatedUser);
    updateAuthUser(updatedUser);
    setFeedback({ type: "success", message: "Profile picture updated successfully!" });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Profile Form update
  const handleProfileSave = async (formData) => {
    try {
      const res = await api.put("/api/users/profile", formData);
      if (res.data?.user) {
        setUser((prev) => ({ ...prev, ...res.data.user }));
        updateAuthUser(res.data.user);
      }
      setFeedback({ type: "success", message: "Profile details updated successfully!" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error("Profile update failed:", error.response?.data || error);
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to update profile. Please try again.",
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleProfileCancel = () => {
    setFeedback(null);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  // Loading state
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-medium text-sm">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <p className="text-destructive font-medium">Session expired. Please sign in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <div className="max-w-4xl px-4 sm:px-6 py-6 sm:py-10 mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold font-heading text-foreground">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal chef information, recipes, and account preferences
          </p>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-4 mb-6 rounded-xl border text-sm flex items-center gap-2 animate-fadeIn ${
              feedback.type === "success"
                ? "bg-success/15 border-success/30 text-success"
                : "bg-destructive/15 border-destructive/30 text-destructive"
            }`}
          >
            <Icon
              name={feedback.type === "success" ? "CheckCircle" : "AlertCircle"}
              size={18}
            />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="mb-8">
          <ProfileHeader user={user} onImageChange={handleAvatarUpdated} />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-border">
          <nav className="flex space-x-6 sm:space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Profile Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Account Preferences
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
        <div className="pt-8 mt-12 border-t border-border">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="mb-4 font-semibold font-heading text-foreground">
              Account Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-xs text-muted-foreground block mb-0.5">Member Since</span>
                <span className="font-semibold text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-xs text-muted-foreground block mb-0.5">User ID</span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  #{user?._id?.slice(-8) || "000000"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-xs text-muted-foreground block mb-0.5">Created Recipes</span>
                <span className="font-semibold text-primary">
                  {user?.totalRecipes || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-xs text-muted-foreground block mb-0.5">Favorited Recipes</span>
                <span className="font-semibold text-destructive">
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
