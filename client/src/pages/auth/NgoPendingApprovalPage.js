import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/authentication/AuthShell";
import PendingApprovalNotice from "../../components/authentication/PendingApprovalNotice";
import useAuth from "../../hooks/useAuth";

const PAGE_ROUTE = "/ngo/pending-approval";

const getNgoStateMessage = (status) => {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  if (status === "suspended") {
    return "Suspended";
  }

  return "Pending";
};

export default function NgoPendingApprovalPage() {
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
      title="NGO Approval Required"
      subtitle="Your NGO profile is under strict administrative review."
    >
      <PendingApprovalNotice
        title={`Current status: ${getNgoStateMessage(profile?.approvalStatus)}`}
        message="Only approved NGO profiles can access the NGO dashboard. If your status is pending, please wait for admin review."
        details={[
          "Pending: Review is in progress.",
          "Rejected/Suspended: Contact platform administration for resolution.",
          "Approved profiles are redirected immediately to the dashboard.",
        ]}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </AuthShell>
  );
}
