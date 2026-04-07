import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/authentication/AuthShell";
import NgoProfileForm from "../../components/authentication/NgoProfileForm";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/authService";
import { createNgoProfile } from "../../services/profileService";

const PAGE_ROUTE = "/ngo/profile-setup";

export default function NgoProfileFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    profile,
    isInitializing,
    refreshSession,
    resolvePostAuthRoute,
  } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    const nextRoute = resolvePostAuthRoute({ user, profile });
    if (nextRoute !== PAGE_ROUTE && location.pathname === PAGE_ROUTE) {
      navigate(nextRoute, { replace: true });
    }
  }, [isInitializing, location.pathname, navigate, profile, resolvePostAuthRoute, user]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError("");

    try {
      await createNgoProfile(payload);
      const session = await refreshSession();
      navigate(resolvePostAuthRoute(session), { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save NGO profile."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Complete NGO Profile"
      subtitle="Stage 2 profile is required before strict admin approval and NGO dashboard access."
    >
      <NgoProfileForm
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={error}
      />
    </AuthShell>
  );
}
