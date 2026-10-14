import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ChefHat, Check } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Checkbox } from "../../components/ui/Checkbox";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { cn } from "../../utils/cn";
import axios from "axios";
import { setAuthSession } from "../../utils/auth";
import { API_BASE_URL } from "../../utils/api";

const CombinedAuth = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("signin"); // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSignIn = authMode === "signin";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
      agreeToTerms: false,
      subscribeNewsletter: false,
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" };
    let score = 0;
    const checks = [
      password?.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    score = checks.filter(Boolean).length;

    if (score <= 2) return { score, text: "Weak", color: "text-destructive" };
    if (score <= 3) return { score, text: "Fair", color: "text-warning" };
    if (score <= 4) return { score, text: "Good", color: "text-success" };
    return { score, text: "Strong", color: "text-success" };
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  const validateForm = () => {
    const newErrors = {};

    if (!isSignIn && !formData?.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!isSignIn && formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData?.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData?.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (formData?.password?.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isSignIn) {
      if (!formData?.confirmPassword?.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData?.password !== formData?.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!formData?.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let res;
      if (isSignIn) {
        //  Login API
        res = await axios.post(`${API_BASE_URL}/api/users/login`, {
          email: formData.email.trim(),
          password: formData.password,
        });
      } else {
        //  Signup API
        res = await axios.post(`${API_BASE_URL}/api/users/signup`, {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
      }

      //  Save token & user using unified auth helper
      setAuthSession(res.data.token, res.data.user, formData.rememberMe);

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Authentication failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background transition-theme">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        <div className="absolute w-32 h-32 rounded-full top-1/4 left-1/4 bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute w-48 h-48 delay-1000 rounded-full bottom-1/4 right-1/4 bg-accent/10 blur-3xl animate-pulse" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden border bg-card border-border rounded-2xl shadow-warm-lg transition-theme">
          {/* Header with Mode Toggle */}
          <div className="relative p-8 pb-4">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>

            <div className="mb-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-primary">
                  <ChefHat className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                {isSignIn ? "Welcome Back" : "Join RecipeHub"}
              </h1>
              <p className="text-muted-foreground">
                {isSignIn
                  ? "Sign in to your RecipeHub account"
                  : "Create your account and start cooking"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-1 mb-6 rounded-lg bg-muted">
              <button
                onClick={() => handleModeSwitch("signin")}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isSignIn
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => handleModeSwitch("signup")}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  !isSignIn
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              {!isSignIn && (
                <div className="relative space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    error={errors?.fullName}
                    className="pl-10"
                    required
                  />
                  <User className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                </div>
              )}

              {/* Email */}
              <div className="relative space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors?.email}
                  className="pl-10"
                  required
                />
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              </div>

              {/* Password */}
              <div className="relative space-y-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isSignIn ? "Enter your password" : "Create a password"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  error={errors?.password}
                  className="pl-10 pr-10"
                  required
                />
                <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                {!isSignIn && formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Password strength:
                      </span>
                      <span
                        className={cn("font-medium", passwordStrength.color)}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="flex mt-1 space-x-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all",
                            passwordStrength.score >= bar
                              ? passwordStrength.score <= 2
                                ? "bg-destructive"
                                : passwordStrength.score <= 3
                                  ? "bg-warning"
                                  : "bg-success"
                              : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {!isSignIn && (
                <div className="relative space-y-2">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    error={errors?.confirmPassword}
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute -translate-y-1/2 right-3 top-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                  {formData.confirmPassword && (
                    <div className="mt-1 text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <span className="flex items-center gap-1 text-success">
                          <Check size={12} /> Passwords match
                        </span>
                      ) : (
                        <span className="text-destructive">
                          Passwords don't match
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Options */}
              <div className="space-y-4">
                {isSignIn ? (
                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={(checked) =>
                        handleInputChange("rememberMe", checked)
                      }
                      label="Remember me"
                    />
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Checkbox
                      checked={formData.agreeToTerms}
                      onChange={(checked) =>
                        handleInputChange("agreeToTerms", checked)
                      }
                      error={errors?.agreeToTerms}
                      label={
                        <span className="text-sm">
                          I agree to the{" "}
                          <Link to="/terms" className="underline text-primary">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="underline text-primary"
                          >
                            Privacy Policy
                          </Link>
                        </span>
                      }
                      required
                    />
                    <Checkbox
                      checked={formData.subscribeNewsletter}
                      onChange={(checked) =>
                        handleInputChange("subscribeNewsletter", checked)
                      }
                      label="Subscribe to newsletter for recipe updates and cooking tips"
                    />
                  </div>
                )}
              </div>

              {/* Submit Error */}
              {errors?.submit && (
                <div className="p-3 text-sm rounded-lg text-destructive bg-destructive/10">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="h-12"
              >
                {loading
                  ? isSignIn
                    ? "Signing in..."
                    : "Creating Account..."
                  : isSignIn
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-4 text-center">
          <p className="p-3 text-xs border rounded-lg text-muted-foreground bg-muted/30 border-border">
            <strong>Demo Mode:</strong> Use any valid email format with any
            password (6+ characters)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CombinedAuth;
