import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat, Mail, Lock } from "lucide-react";
import axios from "axios";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Checkbox } from "../../components/ui/Checkbox";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { setAuthSession } from "../../utils/auth";
import { API_BASE_URL } from "../../utils/api";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true, // Default to true for convenience
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Login response is missing user or token.");
      }

      // Save credentials using unified auth helper
      setAuthSession(token, user, formData.rememberMe);

      // Role-based redirect — role comes from trusted backend response
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);

      setErrors({
        submit:
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please verify your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background transition-colors">
      <div className="relative w-full max-w-md">
        <div className="p-8 border shadow-warm-lg rounded-2xl border-border bg-card">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground shadow-md">
                <ChefHat className="w-7 h-7" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Welcome Back
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your YammiVerse account
            </p>
          </div>

          {/* Theme Toggle in Top Right */}
          <div className="absolute right-6 top-6">
            <ThemeToggle />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  className="pl-10"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={errors.password}
                  className="pl-10 pr-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between gap-3 text-sm">
              <Checkbox
                checked={formData.rememberMe}
                onChange={(checked) => handleInputChange("rememberMe", checked)}
                label="Remember me"
              />

              <Link
                to="/forgot-password"
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Banner */}
            {errors.submit && (
              <div
                role="alert"
                className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center"
              >
                {errors.submit}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
              className="h-11 shadow-md font-semibold text-base"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
