import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChefHat,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ThemeToggle from "../../components/ui/ThemeToggle";
import axios from "axios";

const LogoutConfirmation = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [quickLoginData, setQuickLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const token = localStorage.getItem("recipeHub-token");

  //  Fetch current user from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;
        const res = await axios.get("https://yammiverse.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, [token]);

  const handleInputChange = (field, value) => {
    setQuickLoginData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //  Logout API
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await axios.post(
        "https://yammiverse.onrender.com/api/users/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("recipeHub-token");
      navigate("/home");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleCancelLogout = () => {
    navigate("/home");
  };

  //  Quick login (backend API)
  const handleQuickLogin = async (e) => {
    e?.preventDefault();
    if (!quickLoginData?.email || !quickLoginData?.password) return;

    setLoading(true);
    try {
      const res = await axios.post("https://yammiverse.onrender.com/api/auth/login", {
        email: quickLoginData.email,
        password: quickLoginData.password,
      });

      localStorage.setItem("recipeHub-token", res.data.token);
      setCurrentUser(res.data.user);
      navigate("/home");
    } catch (error) {
      setErrors({ submit: error?.response?.data?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative w-full max-w-md space-y-6">
        {/* Logout Confirmation */}
        <div className="bg-card border border-border rounded-2xl shadow-warm-lg p-8">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-full p-3">
                <LogOut className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Confirm Logout
            </h1>
            <p className="text-muted-foreground">
              Are you sure you want to sign out of your account?
            </p>
          </div>

          {/* Current User */}
          {currentUser && (
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {currentUser?.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning mb-1">
                  You will be signed out
                </p>
                <p className="text-sm text-muted-foreground">
                  Your preferences and favorites will be saved, but you’ll need
                  to sign in again to access them.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              fullWidth
              variant="destructive"
              loading={logoutLoading}
              onClick={handleLogout}
              className="h-12"
            >
              {logoutLoading ? "Signing Out..." : "Yes, Sign Me Out"}
            </Button>

            <Button
              fullWidth
              variant="outline"
              onClick={handleCancelLogout}
              disabled={logoutLoading}
              className="h-12"
            >
              Cancel
            </Button>
          </div>

          {/* Quick Login Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="text-sm text-primary hover:text-primary/80"
            >
              {showQuickLogin ? "Hide quick login" : "Need to switch accounts?"}
            </button>
          </div>
        </div>

        {/* Quick Login */}
        {showQuickLogin && (
          <div className="bg-card border border-border rounded-2xl shadow-warm-lg p-8 animate-in slide-in-from-bottom-2 duration-300">
            <form onSubmit={handleQuickLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={quickLoginData?.email}
                onChange={(e) =>
                  handleInputChange("email", e?.target?.value)
                }
                error={errors?.email}
                required
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={quickLoginData?.password}
                onChange={(e) =>
                  handleInputChange("password", e?.target?.value)
                }
                error={errors?.password}
                required
              />
              {errors?.submit && (
                <div className="text-sm text-destructive text-center">
                  {errors?.submit}
                </div>
              )}
              <Button type="submit" fullWidth loading={loading} className="h-12">
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutConfirmation;