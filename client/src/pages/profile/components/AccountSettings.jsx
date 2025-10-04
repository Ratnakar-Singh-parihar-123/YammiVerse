import React, { useState, useEffect } from "react";
import { Checkbox } from "../../../components/ui/Checkbox";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AccountSettings = ({ onLogout }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const token =
    localStorage.getItem("recipeHub-token") ||
    sessionStorage.getItem("recipeHub-token");

  // 🔹 Fetch settings from backend
  useEffect(() => {
    if (!token) return;

    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          "https://yammiverse.onrender.com/api/users/settings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSettings(res.data.settings);
      } catch (error) {
        console.error("❌ Failed to fetch settings:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  // 🔹 Save setting change to backend
  const handleSettingChange = async (key, value) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated); // Optimistic update

      const res = await axios.put(
        "https://yammiverse.onrender.com/api/users/settings",
        updated,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSettings(res.data.settings); // Confirm backend state
    } catch (error) {
      console.error("❌ Failed to update setting:", error.response?.data || error);
      alert("Failed to update setting. Please try again.");
    }
  };

  // 🔹 Logout with confirmation
  const handleLogout = () => {
    setShowLogoutConfirm(false);

    // Clear tokens
    localStorage.removeItem("recipeHub-token");
    sessionStorage.removeItem("recipeHub-token");

    onLogout?.();

    navigate("/"); // redirect to home
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      {/* 🔔 Notification Preferences */}
      <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <Checkbox
            label="Email notifications for new recipes"
            description="Get notified when new recipes are added to your favorites"
            checked={settings?.emailNotifications}
            onChange={(e) =>
              handleSettingChange("emailNotifications", e.target.checked)
            }
          />
          <Checkbox
            label="Weekly recipe digest"
            description="Receive a weekly summary of trending recipes"
            checked={settings?.weeklyDigest}
            onChange={(e) =>
              handleSettingChange("weeklyDigest", e.target.checked)
            }
          />
          <Checkbox
            label="Recipe recommendations"
            description="Get personalized recipe suggestions based on your preferences"
            checked={settings?.recommendations}
            onChange={(e) =>
              handleSettingChange("recommendations", e.target.checked)
            }
          />
        </div>
      </div>

      {/* 🔒 Privacy Settings */}
      <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
          Privacy Settings
        </h2>
        <div className="space-y-4">
          <Checkbox
            label="Make profile public"
            description="Allow other users to view your profile and recipes"
            checked={settings?.publicProfile}
            onChange={(e) =>
              handleSettingChange("publicProfile", e.target.checked)
            }
          />
          <Checkbox
            label="Show cooking statistics"
            description="Display your recipe count and favorites on your profile"
            checked={settings?.showStats}
            onChange={(e) => handleSettingChange("showStats", e.target.checked)}
          />
        </div>
      </div>

      {/* ⚙️ Account Actions */}
      <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
          Account Actions
        </h2>
        <div className="space-y-4">
          {/* Security */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Account Security</h3>
              <p className="text-sm text-muted-foreground">
                Change password and security settings
              </p>
            </div>
            <Button variant="outline" iconName="Shield" iconPosition="left">
              Security
            </Button>
          </div>

          {/* Export */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your recipes and data
              </p>
            </div>
            <Button variant="outline" iconName="Download" iconPosition="left">
              Export
            </Button>
          </div>

          {/* Logout */}
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h3 className="font-medium text-destructive">Sign Out</h3>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="destructive"
              iconName="LogOut"
              iconPosition="left"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* 🔔 Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Icon
                  name="AlertTriangle"
                  size={20}
                  color="var(--color-destructive)"
                />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Confirm Sign Out
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to sign out? You'll need to sign in again to
              access your recipes and favorites.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
                className="flex-1"
              >
                Sign Out
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;