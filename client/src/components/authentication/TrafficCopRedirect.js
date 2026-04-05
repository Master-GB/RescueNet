import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthLoadingScreen from "./AuthLoadingScreen";

export default function TrafficCopRedirect() {
  const { isInitializing, user, profile, resolvePostAuthRoute } = useAuth();

  if (isInitializing) {
    return <AuthLoadingScreen label="Preparing your route..." />;
  }

  return (
    <Navigate
      to={resolvePostAuthRoute({ user, profile })}
      replace
    />
  );
}
