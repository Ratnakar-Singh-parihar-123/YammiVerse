import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, ChefHat, User, Mail, Lock,
  ShieldCheck, KeyRound, ArrowLeft, Loader2, AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { setAuthSession } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  // Admin setup status
  const [adminSetupAvailable, setAdminSetupAvailable] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState('');

  // Form state
  const [accountType, setAccountType] = useState('user');
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', secret: '',
    agreeToTerms: false, subscribeNewsletter: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = accountType === 'admin';

  // Check admin setup status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setStatusLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/auth/admin-setup-status`);
        setAdminSetupAvailable(res.data.available === true);
      } catch (err) {
        console.warn('Could not check admin setup status:', err.message);
        setStatusError('Could not verify admin setup status.');
        setAdminSetupAvailable(false);
      } finally {
        setStatusLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '', submit: '' }));
  };

  const handleAccountTypeChange = (type) => {
    if (type === 'admin' && !adminSetupAvailable) return;
    setAccountType(type);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (isAdmin && !formData.secret.trim()) newErrors.secret = 'Admin bootstrap secret is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const commonData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      let response;
      if (isAdmin) {
        response = await axios.post(`${API_BASE_URL}/api/admin/bootstrap`, {
          ...commonData,
          secret: formData.secret.trim(),
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/api/users/signup`, commonData);
      }
      const { token, user } = response.data;
      if (!token || !user) throw new Error('Registration response is missing token or user');
      if (isAdmin && user.role !== 'admin') throw new Error('The server did not return an admin account');
      if (!isAdmin && user.role === 'admin') throw new Error('Unexpected admin account returned by signup');
      setAuthSession(token, user, true);
      navigate(isAdmin ? '/admin' : '/home', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      let message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      if (isAdmin && status === 503) message = 'Admin bootstrap is not configured on the server.';
      else if (isAdmin && status === 403) message = 'Invalid admin bootstrap secret.';
      else if (isAdmin && status === 409) message = error.response?.data?.message || 'An admin already exists or this email is in use.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-10 transition-colors bg-background">
      <div className="relative w-full max-w-md">
        <div className="p-6 border bg-card border-border rounded-2xl shadow-warm-lg sm:p-8">
          <div className="absolute top-5 right-5"><ThemeToggle /></div>

          {/* Header */}
          <div className="pt-2 mb-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3.5 rounded-2xl text-primary-foreground shadow-md ${isAdmin ? 'bg-gradient-to-tr from-slate-800 to-slate-600' : 'bg-gradient-to-tr from-primary to-primary/70'}`}>
                {isAdmin ? <ShieldCheck className="h-7 w-7" /> : <ChefHat className="h-7 w-7" />}
              </div>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl font-heading text-foreground">
              {isAdmin ? 'Create Admin Account' : 'Join YammiVerse'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAdmin ? 'Set up the initial administrator account' : 'Create your account and discover amazing recipes'}
            </p>
          </div>

          {/* Account type selector */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-foreground">Account Type</label>
            {statusLoading ? (
              <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking availability...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* User card */}
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange('user')}
                  disabled={loading}
                  aria-pressed={!isAdmin}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm transition-all ${
                    !isAdmin ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <User size={22} />
                  <span className="font-semibold">User</span>
                  <span className="text-xs text-center leading-tight opacity-80">Browse and share recipes</span>
                </button>

                {/* Admin card */}
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange('admin')}
                  disabled={loading || !adminSetupAvailable}
                  aria-pressed={isAdmin}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm transition-all ${
                    !adminSetupAvailable
                      ? 'border-border text-muted-foreground/50 bg-muted/30 cursor-not-allowed'
                      : isAdmin
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <ShieldCheck size={22} />
                  <span className="font-semibold">Admin</span>
                  <span className="text-xs text-center leading-tight opacity-80">
                    {adminSetupAvailable ? 'Full platform control' : 'Registration closed'}
                  </span>
                  {!adminSetupAvailable && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full border border-border">TAKEN</span>
                  )}
                </button>
              </div>
            )}

            {/* Status messages */}
            {!statusLoading && !adminSetupAvailable && !statusError && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin account already exists. Only User registration is available.
              </p>
            )}
            {statusError && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {statusError}
              </p>
            )}
          </div>

          {/* Admin notice */}
          {isAdmin && adminSetupAvailable && (
            <div className="p-3 mb-5 border rounded-xl border-amber-500/30 bg-amber-500/10">
              <div className="flex gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Secure administrator setup</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    This creates the first and only admin account. You must provide the server bootstrap secret. Only one admin is allowed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <Input type="text" placeholder="Your full name" value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={errors.fullName} className="pl-10" required />
                <User className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Input type="email" placeholder="name@example.com" value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email} className="pl-10" required />
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-foreground">Password (minimum 8 characters)</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password"
                  value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password} className="pl-10 pr-10" required />
                <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password"
                  value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword} className="pl-10 pr-10" required />
                <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* Admin bootstrap secret */}
            {isAdmin && (
              <div>
                <label className="block mb-1 text-sm font-medium text-foreground">Admin Bootstrap Secret</label>
                <div className="relative">
                  <Input type={showSecret ? 'text' : 'password'} placeholder="Enter server bootstrap secret"
                    value={formData.secret} onChange={(e) => handleInputChange('secret', e.target.value)}
                    error={errors.secret} className="pl-10 pr-10" autoComplete="off" required />
                  <KeyRound className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                  <button type="button" onClick={() => setShowSecret((p) => !p)}
                    className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground">
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.secret && <p className="mt-1 text-xs text-destructive">{errors.secret}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Obtain this from your server configuration. It is not your account password.</p>
              </div>
            )}

            {/* Terms */}
            <div className="pt-1 space-y-3">
              <Checkbox checked={formData.agreeToTerms}
                onChange={(checked) => handleInputChange('agreeToTerms', checked)}
                label={<span className="text-xs sm:text-sm text-foreground">I agree to the <Link to="/privacy" className="font-medium underline text-primary">Terms &amp; Privacy Policy</Link></span>}
                error={errors.agreeToTerms} required />
              {!isAdmin && (
                <Checkbox checked={formData.subscribeNewsletter}
                  onChange={(checked) => handleInputChange('subscribeNewsletter', checked)}
                  label={<span className="text-xs sm:text-sm text-muted-foreground">Receive tasty recipes and updates in newsletter</span>} />
              )}
              {errors.agreeToTerms && <p className="text-xs text-destructive">{errors.agreeToTerms}</p>}
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div role="alert" className="p-3 text-sm border rounded-lg bg-destructive/10 border-destructive/30 text-destructive">
                {errors.submit}
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" fullWidth loading={loading} disabled={loading || statusLoading}
              className="mt-2 text-base font-semibold shadow-md h-11">
              {loading ? (isAdmin ? 'Creating Admin...' : 'Creating Account...') : (isAdmin ? 'Create Admin Account' : 'Create Account')}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-sm text-center text-muted-foreground">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              <ArrowLeft size={15} /> Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
