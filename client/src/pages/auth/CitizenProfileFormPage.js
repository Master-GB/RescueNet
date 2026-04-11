import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CitizenProfileForm from "../../components/authentication/CitizenProfileForm";
import AuthShell from "../../components/authentication/AuthShell";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/authService";
import { createCitizenProfile } from "../../services/profileService";

const PAGE_ROUTE = "/citizen/profile-setup";

export default function CitizenProfileFormPage() {
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
      await createCitizenProfile(payload);
      const session = await refreshSession();
      navigate(resolvePostAuthRoute(session), { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save citizen profile."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Complete Citizen Profile"
      subtitle="Stage 2 is required before you can enter the citizen dashboard."
    >
      <CitizenProfileForm
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={error}
      />
    </AuthShell>
  );
}
