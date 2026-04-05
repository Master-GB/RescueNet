import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthAlert from "../../components/authentication/AuthAlert";
import AuthInput from "../../components/authentication/AuthInput";
import AuthShell from "../../components/authentication/AuthShell";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAccount, resolvePostAuthRoute } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  const emailError = useMemo(() => {
    if (!email) {
      return "";
    }

    return EMAIL_PATTERN.test(email) ? "" : "Use a valid email format.";
  }, [email]);

  const canSubmit = email.trim() && password.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");
    setHint("");

    try {
      const { session } = await loginAccount({
        email: email.trim().toLowerCase(),
        password,
      });

      navigate(resolvePostAuthRoute(session), { replace: true });
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "Sign in failed. Please try again.",
      );
      setError(message);

      if (message.toLowerCase().includes("not verified")) {
        setHint(
          "Your account is still unverified. Please contact support/admin if you were previously registered but cannot continue verification.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign In"
      subtitle="Use your RescueNet account to continue to your role dashboard."
      footer={
        <div className="flex items-center justify-between gap-3 text-auth-text-muted">
          <Link className="text-primary-container font-semibold hover:underline" to="/auth/register">
            Create account
          </Link>
          <Link className="text-secondary-container font-semibold hover:underline" to="/auth/forgot-password">
            Forgot password?
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthAlert message={error} variant="error" />
        <AuthAlert message={hint} variant="warning" />

        <AuthInput
          id="login-email"
          type="email"
          label="Email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailError}
          required
        />

        <AuthInput
          id="login-password"
          type="password"
          label="Password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          placeholder="Enter password"
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          disabled={submitting || !canSubmit || Boolean(emailError)}
          className="w-full py-3 text-sm font-semibold disabled:opacity-70"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
