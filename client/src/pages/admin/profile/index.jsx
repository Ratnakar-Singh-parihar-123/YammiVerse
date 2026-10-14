import React, { useEffect, useRef, useState } from "react";
import { Camera, Save, Lock, Eye, EyeOff, Shield, ChefHat } from "lucide-react";
import api, { getImageUrl } from "../../../utils/api";
import { getAuthUser, updateAuthUser } from "../../../utils/auth";

const FormField = ({ label, id, error, children }) => (
  <div>
    <label
      htmlFor={id}
      className="block mb-1 text-sm font-medium text-foreground"
    >
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${className}`}
    {...props}
  />
);

const AdminProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    location: "",
    website: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  // Password change
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  // Avatar
  const avatarRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

  // Load profile
  useEffect(() => {
    api
      .get("/api/admin/profile")
      .then((res) => {
        const u = res.data.user;
        setUser(u);
        setForm({
          fullName: u.fullName || "",
          bio: u.bio || "",
          location: u.location || "",
          website: u.website || "",
        });
      })
      .catch((err) => {
        console.error("Load profile error:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSaveMsg({ type: "", text: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (form.website && !/^https?:\/\/.+/.test(form.website))
      errs.website = "Website must start with http:// or https://";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveMsg({ type: "", text: "" });
    try {
      const res = await api.put("/api/admin/profile", form);
      setUser(res.data.user);
      updateAuthUser(res.data.user);
      setSaveMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setSaveMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setAvatarMsg("");
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await api.put("/api/admin/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
      updateAuthUser({ ...getAuthUser(), avatar: res.data.avatar });
      setAvatarMsg("Avatar updated!");
    } catch (err) {
      setAvatarMsg("Failed to upload avatar");
    } finally {
      setAvatarLoading(false);
      setTimeout(() => setAvatarMsg(""), 3000);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }
    setPwSaving(true);
    try {
      await api.put("/api/admin/profile/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : null;
  const initials = user?.fullName?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar section */}
      <div className="p-6 border bg-card border-border rounded-xl shadow-warm">
        <h3 className="flex items-center gap-2 mb-4 text-base font-semibold text-foreground">
          <ChefHat className="w-4 h-4 text-primary" />
          Profile Photo
        </h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.fullName}
                className="object-cover w-20 h-20 border-2 rounded-full shadow-sm border-border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/no_image.png";
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold border-2 rounded-full bg-primary/15 text-primary border-border">
                {initials}
              </div>
            )}
            {avatarLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={avatarLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-border text-foreground hover:bg-muted disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Change Photo
            </button>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP · Max 5MB
            </p>
            {avatarMsg && (
              <p className="mt-1 text-xs text-success">{avatarMsg}</p>
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      {/* Role badge — read-only */}
      <div className="flex items-center gap-3 p-4 border bg-primary/5 border-primary/20 rounded-xl">
        <Shield className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Administrator</p>
          <p className="text-xs text-muted-foreground">
            Your role cannot be changed through this form.
          </p>
        </div>
      </div>

      {/* Profile form */}
      <div className="p-6 border bg-card border-border rounded-xl shadow-warm">
        <h3 className="mb-5 text-base font-semibold text-foreground">
          Personal Information
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name *"
              id="fullName"
              error={errors.fullName}
            >
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => handleField("fullName", e.target.value)}
                placeholder="Your full name"
              />
            </FormField>
            <FormField label="Email" id="email">
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="cursor-not-allowed opacity-60"
              />
            </FormField>
          </div>
          <FormField label="Bio" id="bio">
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => handleField("bio", e.target.value)}
              rows={3}
              placeholder="Tell us a bit about yourself…"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Location" id="location">
              <Input
                id="location"
                value={form.location}
                onChange={(e) => handleField("location", e.target.value)}
                placeholder="City, Country"
              />
            </FormField>
            <FormField label="Website" id="website" error={errors.website}>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => handleField("website", e.target.value)}
                placeholder="https://example.com"
              />
            </FormField>
          </div>

          {saveMsg.text && (
            <p
              className={`text-sm font-medium ${saveMsg.type === "success" ? "text-success" : "text-destructive"}`}
            >
              {saveMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div className="p-6 border bg-card border-border rounded-xl shadow-warm">
        <h3 className="flex items-center gap-2 mb-5 text-base font-semibold text-foreground">
          <Lock className="w-4 h-4 text-primary" />
          Change Password
        </h3>
        <form onSubmit={handlePwChange} className="space-y-4">
          {[
            {
              label: "Current Password",
              field: "currentPassword",
              show: "current",
            },
            { label: "New Password", field: "newPassword", show: "new" },
            {
              label: "Confirm New Password",
              field: "confirmPassword",
              show: "confirm",
            },
          ].map(({ label, field, show }) => (
            <FormField key={field} label={label} id={field}>
              <div className="relative">
                <Input
                  id={field}
                  type={showPw[show] ? "text" : "password"}
                  value={pwForm[field]}
                  onChange={(e) => {
                    setPwForm((p) => ({ ...p, [field]: e.target.value }));
                    setPwMsg({ type: "", text: "" });
                  }}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, [show]: !p[show] }))}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw[show] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormField>
          ))}

          {pwMsg.text && (
            <p
              className={`text-sm font-medium ${pwMsg.type === "success" ? "text-success" : "text-destructive"}`}
            >
              {pwMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            {pwSaving ? "Changing…" : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
