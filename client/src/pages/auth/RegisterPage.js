import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthAlert from "../../components/authentication/AuthAlert";
import AuthInput from "../../components/authentication/AuthInput";
import AuthMarketingCarousel from "../../components/authentication/AuthMarketingCarousel";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/authService";
import { PROFILE_IMAGE_ACCEPT, PROFILE_IMAGE_HELP_TEXT, validateProfileImageFile } from "../../utils/profileImageValidation";
import RNlogo from '../../assets/images/rescuenet-nobg.png';

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
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("");
  const [profileImageError, setProfileImageError] = useState("");

  useEffect(() => {
    return () => {
      if (profileImagePreviewUrl) {
        URL.revokeObjectURL(profileImagePreviewUrl);
      }
    };
  }, [profileImagePreviewUrl]);

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
    !passwordError &&
    !profileImageError;

  const resetProfileImage = () => {
    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImageFile(null);
    setProfileImagePreviewUrl("");
    setProfileImageError("");
  };

  const handleProfileImageChange = (event) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      resetProfileImage();
      return;
    }

    const validationError = validateProfileImageFile(nextFile);
    if (validationError) {
      resetProfileImage();
      setProfileImageError(validationError);
      event.target.value = "";
      return;
    }

    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(nextFile);

    setProfileImageFile(nextFile);
    setProfileImagePreviewUrl(previewUrl);
    setProfileImageError("");
    setError("");
  };

  const buildRegisterPayload = () => {
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    };

    if (!profileImageFile) {
      return payload;
    }

    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("role", payload.role);
    formData.append("profileImage", profileImageFile);
    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Please fix validation errors before continuing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await registerAccount(buildRegisterPayload());

      navigate("/auth/verify-account", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  };
  const MARKETING_HEADLINE_TEXT = "Help people, become a savior.";

  return (
    <main className="flex flex-col md:flex-row h-screen overflow-hidden" data-purpose="auth-page-container">
      <AuthMarketingCarousel
        headlineText={MARKETING_HEADLINE_TEXT}
        images={[
          "https://images.pexels.com/photos/9424562/pexels-photo-9424562.jpeg",
          "https://images.pexels.com/photos/15558861/pexels-photo-15558861.jpeg",
          "https://www.chieflearningofficer.com/wp-content/uploads/2022/07/AdobeStock_171085784-1536x1024.jpeg"
        ]}
        supportingText={"Join RescueNet — help people in crisis and become part of the solution."}
      />

      <section className="w-full md:w-1/2 bg-auth-bg flex flex-col overflow-y-auto p-8 md:p-12 lg:p-16" data-purpose="register-panel">
        <div className="max-w-xl w-full mx-auto my-auto">
          <div className="my-12 bg-auth-surface rounded-3xl p-6 sm:p-8 shadow-auth-shell-panel border border-auth-border-subtle flex flex-col justify-center">
            {/* Replace your current img tag with this: */}
            <img 
              src={RNlogo} 
              alt="RescueNet logo" 
              className="h-14 w-auto object-contain self-start" 
            />
            <h1 className="mt-3 text-3xl font-bold leading-tight text-auth-text">Create Account</h1>
            <p className="mt-3 text-sm text-auth-text-soft leading-relaxed">Register your role and continue immediately to mandatory OTP verification.</p>

            <div className="mt-8">
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
                  <span className="mb-2 block text-xs uppercase tracking-[0.08em] text-secondary-container font-semibold">
                    Role
                  </span>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="focus-ghost w-full rounded-lg bg-auth-bg border border-auth-border px-4 py-3 text-sm text-auth-text outline-none transition focus:bg-auth-surface focus:border-primary-container"
                  >
                    {roleOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.08em] text-secondary-container font-semibold">
                    Profile Picture (Optional)
                  </span>
                  <input
                    type="file"
                    accept={PROFILE_IMAGE_ACCEPT}
                    onChange={handleProfileImageChange}
                    className="focus-ghost w-full rounded-lg bg-auth-bg border border-auth-border px-4 py-3 text-sm text-auth-text outline-none transition focus:bg-auth-surface focus:border-primary-container"
                  />
                  <p className="mt-2 text-xs text-auth-text-muted">{PROFILE_IMAGE_HELP_TEXT}</p>

                  {profileImageError ? (
                    <p className="mt-2 text-xs text-red-500">{profileImageError}</p>
                  ) : null}

                  {profileImagePreviewUrl ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={profileImagePreviewUrl}
                        alt="Selected profile preview"
                        className="h-14 w-14 rounded-full object-cover border border-auth-border"
                      />
                      <button
                        type="button"
                        onClick={resetProfileImage}
                        className="rounded-md border border-auth-border px-3 py-1.5 text-xs font-semibold text-auth-text-soft transition hover:bg-auth-surface"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </label>

                <Button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="w-full py-3 text-sm font-semibold disabled:opacity-70"
                >
                  {submitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>

            <div className="mt-8 border-t border-auth-border-subtle pt-6 text-sm text-auth-text-muted">
              Already have an account?{" "}
              <Link className="text-primary-container font-semibold hover:underline" to="/auth/login">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
