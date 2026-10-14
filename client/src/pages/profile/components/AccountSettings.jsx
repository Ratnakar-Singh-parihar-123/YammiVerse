import React, { useState, useEffect } from "react";
import { Checkbox } from "../../../components/ui/Checkbox";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import api from "../../../utils/api";
import { clearAuthSession } from "../../../utils/auth";
import { useNavigate } from "react-router-dom";

const AccountSettings = ({ onLogout }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyDigest: false,
    recommendations: true,
    publicProfile: true,
    showStats: true,
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/users/settings");
        if (res.data?.settings) {
          setSettings(res.data.settings);
        }
      } catch (error) {
        console.error("❌ Failed to fetch settings:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Save setting change to backend
  const handleSettingChange = async (key, val) => {
    // Normalizes boolean value whether passed directly or via event
    const booleanVal = typeof val === "boolean" ? val : Boolean(val?.target?.checked);

    try {
      const updated = { ...settings, [key]: booleanVal };
      setSettings(updated); // optimistic UI update

      const res = await api.put("/api/users/settings", updated);
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("❌ Failed to update setting:", error.response?.data || error);
      alert("Failed to update setting. Please try again.");
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    clearAuthSession();
    if (onLogout) onLogout();
    navigate("/home", { replace: true });
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading preferences...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <div className="p-3 text-xs sm:text-sm rounded-lg bg-success/15 border border-success/30 text-success flex items-center gap-2 animate-fadeIn">
          <Icon name="CheckCircle" size={16} />
          <span>Settings saved successfully</span>
        </div>
      )}

      {/* 🔔 Notification Preferences */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-warm">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <Checkbox
            label="Email notifications for new recipes"
            description="Get notified when recipes are added in categories you love"
            checked={Boolean(settings?.emailNotifications)}
            onChange={(checked) =>
              handleSettingChange("emailNotifications", checked)
            }
          />
          <Checkbox
            label="Weekly recipe digest"
            description="Receive a weekly curated summary of trending recipes"
            checked={Boolean(settings?.weeklyDigest)}
            onChange={(checked) =>
              handleSettingChange("weeklyDigest", checked)
            }
          />
          <Checkbox
            label="Recipe recommendations"
            description="Get personalized recipe suggestions based on your tastes"
            checked={Boolean(settings?.recommendations)}
            onChange={(checked) =>
              handleSettingChange("recommendations", checked)
            }
          />
        </div>
      </div>

      {/* 🔒 Privacy Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-warm">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
          Privacy Settings
        </h2>
        <div className="space-y-4">
          <Checkbox
            label="Make profile public"
            description="Allow other foodies on YammiVerse to view your created recipes"
            checked={Boolean(settings?.publicProfile)}
            onChange={(checked) =>
              handleSettingChange("publicProfile", checked)
            }
          />
          <Checkbox
            label="Show cooking statistics"
            description="Display your recipe count and favorites on your profile card"
            checked={Boolean(settings?.showStats)}
            onChange={(checked) =>
              handleSettingChange("showStats", checked)
            }
          />
        </div>
      </div>

      {/* ⚙️ Account Actions */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-warm">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
          Account Actions
        </h2>
        <div className="space-y-3">
          {/* Logout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-xl bg-destructive/5">
            <div>
              <h3 className="font-semibold text-destructive">Sign Out</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sign out of your active YammiVerse session on this device
              </p>
            </div>
            <Button
              variant="destructive"
              iconName="LogOut"
              iconPosition="left"
              onClick={() => setShowLogoutConfirm(true)}
              className="font-medium shrink-0"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* 🔔 Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-warm-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
                <Icon name="AlertTriangle" size={22} />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground">
                Confirm Sign Out
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to sign out? You will need to enter your
              credentials again to view your private favorites and edit recipes.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
                className="flex-1 font-semibold"
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
