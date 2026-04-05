import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthLoadingScreen from "./AuthLoadingScreen";

export default function ProtectedRoute({ children }) {
  const { isInitializing, user } = useAuth();

  if (isInitializing) {
    return <AuthLoadingScreen label="Preparing your workspace..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.isAccountVerified) {
    return <Navigate to="/auth/verify-account" replace />;
  }

  return children;
}
