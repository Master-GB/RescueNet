import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthAlert from "../../components/authentication/AuthAlert";
import AuthInput from "../../components/authentication/AuthInput";
import AuthShell from "../../components/authentication/AuthShell";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleOptions = [
  "CITIZEN",
  "VOLUNTEER",
  "NGO",
  "ADMIN",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerAccount } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CITIZEN");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nameError = useMemo(() => {
    if (!name) {
      return "";
    }

    return name.trim().length <= 60 ? "" : "Name must be at most 60 characters.";
  }, [name]);

  const emailError = useMemo(() => {
    if (!email) {
      return "";
    }

    return EMAIL_PATTERN.test(email) ? "" : "Use a valid email format.";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) {
      return "";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (password.length > 64) {
      return "Password must be at most 64 characters.";
    }

    return "";
  }, [password]);

  const canSubmit =
    name.trim() &&
    email.trim() &&
    password &&
    !nameError &&
    !emailError &&
    !passwordError;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Please fix validation errors before continuing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await registerAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      navigate("/auth/verify-account", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Register your role and continue immediately to mandatory OTP verification."
      footer={
        <div className="text-on-surface opacity-80">
          Already have an account?{" "}
          <Link className="text-primary hover:underline" to="/auth/login">
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthAlert message={error} variant="error" />

        <AuthInput
          id="register-name"
          label="Name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          placeholder="Full name"
          maxLength={60}
          autoComplete="name"
          error={nameError}
          required
        />

        <AuthInput
          id="register-email"
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
          id="register-password"
          type="password"
          label="Password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          placeholder="8 to 64 characters"
          autoComplete="new-password"
          hint="Use 8 to 64 characters."
          error={passwordError}
          required
        />

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.08em] text-secondary">
            Role
          </span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="focus-ghost w-full rounded-lg bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none"
          >
            {roleOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full py-3 text-sm font-semibold disabled:opacity-70"
        >
          {submitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
