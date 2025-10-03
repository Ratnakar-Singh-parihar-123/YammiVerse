import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Checkbox } from "../../components/ui/Checkbox";
import ThemeToggle from "../../components/ui/ThemeToggle";
import axios from "axios";
import ForgotPassword from "components/ForgotPasswordFlow";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.email?.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData?.password?.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await axios.post("https://yammiverse.onrender.com/api/users/login", {
        email: formData.email,
        password: formData.password,
      });

      //  Token storage based on "Remember Me"
      if (formData.rememberMe) {
        localStorage.setItem("recipeHub-token", res.data.token);
        localStorage.setItem("recipeHub-user", JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem("recipeHub-token", res.data.token);
        sessionStorage.setItem("recipeHub-user", JSON.stringify(res.data.user));
      }

      navigate("/home");
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your RecipeHub account
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors?.email}
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={errors?.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/*  Fixed Checkbox */}
              <Checkbox
                checked={formData.rememberMe}
                onChange={(checked) => handleInputChange("rememberMe", checked)}
                label="Remember me"
              />
              <Link to="/forgot-password" className="text-sm text-primary">
                Forgot password?
              </Link>
            </div>

            {errors?.submit && (
              <p className="text-sm text-destructive">{errors.submit}</p>
            )}

            <Button type="submit" fullWidth loading={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;