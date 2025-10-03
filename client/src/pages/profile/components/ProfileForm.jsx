import React, { useState, useEffect } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const ProfileForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 🔄 Sync when parent updates user
  useEffect(() => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    });
    setHasChanges(false);
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || "",
    }));
    setHasChanges(true);
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData?.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await onSave?.(formData); // 🔥 Parent call karega backend
      setHasChanges(false);
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      alert("Failed to update profile. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmCancel) return;
    }
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    });
    setHasChanges(false);
    setErrors({});
    onCancel?.();
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-warm">
      <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
        Personal Information
      </h2>
      <div className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          value={formData?.fullName || ""}
          onChange={(e) => handleInputChange("fullName", e?.target?.value)}
          error={errors?.fullName}
          required
          placeholder="Enter your full name"
        />
        <Input
          label="Email Address"
          type="email"
          value={formData?.email || ""}
          onChange={(e) => handleInputChange("email", e?.target?.value)}
          error={errors?.email}
          required
          placeholder="Enter your email address"
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Bio
          </label>
          <textarea
            value={formData?.bio || ""}
            onChange={(e) => handleInputChange("bio", e?.target?.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
        </div>
        <Input
          label="Location"
          type="text"
          value={formData?.location || ""}
          onChange={(e) => handleInputChange("location", e?.target?.value)}
          placeholder="City, Country"
        />
        <Input
          label="Website"
          type="url"
          value={formData?.website || ""}
          onChange={(e) => handleInputChange("website", e?.target?.value)}
          placeholder="https://your-website.com"
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="default"
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
            iconName="Save"
            iconPosition="left"
            className="sm:flex-1"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="sm:flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;