import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { isFullyOnboarded } from "../../services/authRouting";
import ProtectedRoute from "./ProtectedRoute";

export default function RoleRoute({
  allowedRoles = [],
  requireFullyOnboarded = false,
  children,
}) {
  const { user, profile, resolvePostAuthRoute } = useAuth();

  return (
    <ProtectedRoute>
      {!allowedRoles.includes(user?.role) ? (
        <Navigate to={resolvePostAuthRoute({ user, profile })} replace />
      ) : requireFullyOnboarded && !isFullyOnboarded({ user, profile }) ? (
        <Navigate to={resolvePostAuthRoute({ user, profile })} replace />
      ) : (
        children
      )}
    </ProtectedRoute>
  );
}
