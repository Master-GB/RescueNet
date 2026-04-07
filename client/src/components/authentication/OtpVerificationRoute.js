import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthLoadingScreen from "./AuthLoadingScreen";

export default function OtpVerificationRoute({ children }) {
  const { isInitializing, user, profile, resolvePostAuthRoute } = useAuth();

  if (isInitializing) {
    return <AuthLoadingScreen label="Loading verification..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.isAccountVerified) {
    return (
      <Navigate
        to={resolvePostAuthRoute({ user, profile })}
        replace
      />
    );
  }

  return children;
}
