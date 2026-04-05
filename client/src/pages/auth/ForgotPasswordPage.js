import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthAlert from "../../components/authentication/AuthAlert";
import AuthInput from "../../components/authentication/AuthInput";
import AuthShell from "../../components/authentication/AuthShell";
import OtpInput from "../../components/authentication/OtpInput";
import Button from "../../components/ui/Button";
import {
  getApiErrorMessage,
  resetPassword,
  sendResetOtp,
  verifyResetOtp,
} from "../../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const passwordError = useMemo(() => {
    if (!newPassword) {
      return "";
    }

    if (newPassword.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (newPassword.length > 64) {
      return "Password must be at most 64 characters.";
    }

    return "";
  }, [newPassword]);

  const handleRequestCode = async (event) => {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendResetOtp(email.trim().toLowerCase());
      setStatus("Reset code sent to your email.");
      setStep("verify");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to send reset code."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError("Code must be exactly 6 numeric digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyResetOtp({
        email: email.trim().toLowerCase(),
        code,
      });
      setStatus("Code verified. Set your new password.");
      setStep("reset");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "OTP verification failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        newPassword,
      });
      setStatus("Password reset successful. Redirecting to login...");
      setStep("done");

      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 1200);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Password reset failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Complete the 3-step reset flow: request code, verify code, set a new password."
      footer={
        <Link className="text-primary hover:underline" to="/auth/login">
          Back to Sign In
        </Link>
      }
    >
      <AuthAlert message={error} variant="error" />
      <AuthAlert message={status} variant="success" />

      {step === "request" ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <AuthInput
            id="reset-email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            required
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold disabled:opacity-70"
          >
            {loading ? "Sending code..." : "Request Reset Code"}
          </Button>
        </form>
      ) : null}

      {step === "verify" ? (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <OtpInput value={code} onChange={setCode} disabled={loading} />
          <Button
            type="submit"
            disabled={loading || !/^\d{6}$/.test(code)}
            className="w-full py-3 font-semibold disabled:opacity-70"
          >
            {loading ? "Verifying code..." : "Verify Code"}
          </Button>
        </form>
      ) : null}

      {step === "reset" ? (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <AuthInput
            id="reset-new-password"
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setError("");
            }}
            placeholder="8 to 64 characters"
            required
            error={passwordError}
          />

          <AuthInput
            id="reset-confirm-password"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError("");
            }}
            placeholder="Re-enter new password"
            required
          />

          <Button
            type="submit"
            disabled={loading || Boolean(passwordError)}
            className="w-full py-3 font-semibold disabled:opacity-70"
          >
            {loading ? "Updating password..." : "Set New Password"}
          </Button>
        </form>
      ) : null}

      {step === "done" ? (
        <p className="text-sm text-on-surface opacity-80">
          Redirecting to login...
        </p>
      ) : null}
    </AuthShell>
  );
}
