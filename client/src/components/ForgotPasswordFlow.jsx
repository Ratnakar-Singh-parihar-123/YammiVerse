// src/pages/auth/ForgotPasswordFlow.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Icon from "./AppIcon";   // ✅ fixed path
import Button from "./ui/Button";
import Input from "./ui/Input";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // ✅ backend URL

export default function ForgotPasswordFlow() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("request"); // request | otp | reset
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const resendTimerRef = useRef(null);

  // Reset password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ start resend cooldown
  const startResendCooldown = () => {
    setResendTimer(RESEND_COOLDOWN);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  // 1) Request OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setStage("otp");
      setOtp("");
      setInfo("✅ OTP sent to your email. It will expire in 10 minutes.");
      startResendCooldown();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to send OTP. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 2) Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/auth/verify-otp`, { email, otp });
      const token = res.data?.resetToken ?? null;
      if (!token) {
        setError("Server did not provide reset token. Contact support.");
        return;
      }
      setResetToken(token);
      setStage("reset");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setInfo("");
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setInfo("🔄 OTP resent to your email.");
      startResendCooldown();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 3) Reset Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email,
        resetToken,
        newPassword,
      });
      setInfo("✅ Password updated. Redirecting to login...");
      setTimeout(() => {
        navigate(`/combined-auth?email=${encodeURIComponent(email)}`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // OTP input helper
  const onOtpChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Lock" size={20} />
          <h1 className="text-lg font-semibold">Forgot password</h1>
        </div>

        {/* Error & Info Messages */}
        {error && <div className="mb-3 text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}
        {info && <div className="mb-3 text-sm text-foreground bg-success/10 p-3 rounded">{info}</div>}

        {/* Stage: Request OTP */}
        {stage === "request" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <label htmlFor="email" className="text-sm text-muted-foreground">Enter your email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
            </div>
          </form>
        )}

        {/* Stage: Verify OTP */}
        {stage === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>.
            </p>
            <div>
              <label htmlFor="otp" className="text-sm text-muted-foreground">Enter OTP</label>
              <input
                id="otp"
                inputMode="numeric"
                pattern="\d*"
                className="w-full text-center text-lg font-medium tracking-widest p-3 rounded-md border border-border bg-background mt-2"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                maxLength={OTP_LENGTH}
                placeholder={"—".repeat(OTP_LENGTH)}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {resendTimer > 0 ? <span>Resend in {resendTimer}s</span> : (
                  <button type="button" onClick={handleResend} className="text-sm text-primary hover:underline">Resend OTP</button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setStage("request")}>Change email</Button>
                <Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</Button>
              </div>
            </div>
          </form>
        )}

        {/* Stage: Reset Password */}
        {stage === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter a new password for <strong>{email}</strong></p>
            <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setStage("otp")}>Back</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save password"}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}