import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/authentication/AuthShell";
import PendingApprovalNotice from "../../components/authentication/PendingApprovalNotice";
import useAuth from "../../hooks/useAuth";

const PAGE_ROUTE = "/volunteer/pending-approval";

export default function VolunteerPendingApprovalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    profile,
    isInitializing,
    refreshSession,
    resolvePostAuthRoute,
  } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    const nextRoute = resolvePostAuthRoute({ user, profile });
    if (nextRoute !== PAGE_ROUTE && location.pathname === PAGE_ROUTE) {
      navigate(nextRoute, { replace: true });
    }
  }, [isInitializing, location.pathname, navigate, profile, resolvePostAuthRoute, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const session = await refreshSession();
      const nextRoute = resolvePostAuthRoute(session);
      if (nextRoute !== PAGE_ROUTE) {
        navigate(nextRoute, { replace: true });
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AuthShell
      title="Pending Admin Approval"
      subtitle="Your volunteer profile has been submitted. Access is temporarily restricted."
    >
      <PendingApprovalNotice
        title="Volunteer verification in progress"
        message="An administrator must verify your volunteer profile before dashboard features become available."
        details={[
          "You can refresh your status at any time from this screen.",
          "Once approved, you will be redirected to the volunteer dashboard automatically.",
        ]}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </AuthShell>
  );
}
