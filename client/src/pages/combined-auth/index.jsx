import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ChefHat, Check } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Checkbox } from "../../components/ui/Checkbox";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { cn } from "../../utils/cn";
import axios from "axios";

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
        // ✅ Login API
        res = await axios.post("http://localhost:5000/api/users/login", {
          email: formData.email,
          password: formData.password,
        });
      } else {
        // ✅ Signup API
        res = await axios.post("http://localhost:5000/api/users/signup", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
      }

      // ✅ Save token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({
        submit:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Authentication failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    console.log(`${isSignIn ? "Login" : "Register"} with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-background transition-theme flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-warm-lg overflow-hidden transition-theme">
          {/* Header with Mode Toggle */}
          <div className="relative p-8 pb-4">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary rounded-full p-3">
                  <ChefHat className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isSignIn ? "Welcome Back" : "Join RecipeHub"}
              </h1>
              <p className="text-muted-foreground">
                {isSignIn
                  ? "Sign in to your RecipeHub account"
                  : "Create your account and start cooking"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1 mb-6">
              <button
                onClick={() => handleModeSwitch("signin")}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isSignIn
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
                    : "text-muted-foreground hover:text-foreground"
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
                <div className="space-y-2 relative">
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
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2 relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors?.email}
                  className="pl-10"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignIn ? "Enter your password" : "Create a password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={errors?.password}
                  className="pl-10 pr-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                {!isSignIn && formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={cn("font-medium", passwordStrength.color)}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="flex space-x-1 mt-1">
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
                              : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {!isSignIn && (
                <div className="space-y-2 relative">
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  {formData.confirmPassword && (
                    <div className="mt-1 text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <span className="text-success flex items-center gap-1">
                          <Check size={12} /> Passwords match
                        </span>
                      ) : (
                        <span className="text-destructive">Passwords don't match</span>
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
                      onChange={(checked) => handleInputChange("rememberMe", checked)}
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
                      onChange={(checked) => handleInputChange("agreeToTerms", checked)}
                      error={errors?.agreeToTerms}
                      label={
                        <span className="text-sm">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy" className="text-primary underline">
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
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" fullWidth loading={loading} className="h-12">
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
          <p className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg p-3">
            <strong>Demo Mode:</strong> Use any valid email format with any
            password (6+ characters)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CombinedAuth;