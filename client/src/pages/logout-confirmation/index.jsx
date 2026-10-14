import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ThemeToggle from "../../components/ui/ThemeToggle";
import api from "../../utils/api";
import {
  getAuthToken,
  getAuthUser,
  clearAuthSession,
  setAuthSession,
} from "../../utils/auth";

const LogoutConfirmation = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getAuthUser());
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [quickLoginData, setQuickLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const token = getAuthToken();

  // Fetch latest current user from backend if token exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;
        const res = await api.get("/api/users/me");
        setCurrentUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user in logout confirmation:", error);
      }
    };
    fetchUser();
  }, [token]);

  const handleInputChange = (field, value) => {
    setQuickLoginData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "", submit: "" }));
    }
  };

  // Logout API
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      if (token) {
        await api.post("/api/users/logout");
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuthSession();
      setLogoutLoading(false);
      navigate("/home", { replace: true });
    }
  };

  const handleCancelLogout = () => {
    navigate(-1);
  };

  // Quick switch account login
  const handleQuickLogin = async (e) => {
    e?.preventDefault();
    if (!quickLoginData?.email || !quickLoginData?.password) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await api.post("/api/users/login", {
        email: quickLoginData.email.trim(),
        password: quickLoginData.password,
      });

      setAuthSession(res.data.token, res.data.user, true);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrors({
        submit:
          error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="relative w-full max-w-md space-y-6">
        {/* Logout Confirmation Card */}
        <div className="p-8 border bg-card border-border rounded-2xl shadow-warm-lg">
          {/* Theme Toggle */}
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3.5 border rounded-2xl bg-destructive/10 border-destructive/20 text-destructive shadow-sm">
                <LogOut className="w-7 h-7" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold font-heading text-foreground">
              Confirm Logout
            </h1>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to sign out of YammiVerse?
            </p>
          </div>

          {/* Current User */}
          {currentUser && (
            <div className="p-4 mb-6 border rounded-xl bg-muted/40 border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {currentUser?.fullName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="p-4 mb-6 border rounded-xl bg-warning/10 border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="mb-1 text-sm font-semibold text-warning">
                  You will be signed out
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your saved favorites and recipes remain safe in the cloud. You
                  can sign back in at any time.
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
              className="h-11 font-semibold"
            >
              {logoutLoading ? "Signing Out..." : "Yes, Sign Me Out"}
            </Button>

            <Button
              fullWidth
              variant="outline"
              onClick={handleCancelLogout}
              disabled={logoutLoading}
              className="h-11"
            >
              Cancel and Stay Signed In
            </Button>
          </div>

          {/* Quick Login Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {showQuickLogin ? "Hide switch account" : "Need to switch accounts?"}
            </button>
          </div>
        </div>

        {/* Quick Login Form */}
        {showQuickLogin && (
          <div className="p-6 border bg-card border-border rounded-2xl shadow-warm-lg animate-fadeIn">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Sign in to another account
            </h2>
            <form onSubmit={handleQuickLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter email"
                value={quickLoginData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors?.email}
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={quickLoginData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={errors?.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors?.submit && (
                <div className="p-2.5 text-xs text-center text-destructive bg-destructive/10 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="h-10"
              >
                {loading ? "Signing In..." : "Sign In & Switch"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutConfirmation;
