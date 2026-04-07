import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthLoadingScreen from "./AuthLoadingScreen";

export default function GuestRoute({ children }) {
  const { isInitializing, user, profile, resolvePostAuthRoute } = useAuth();

  if (isInitializing) {
    return <AuthLoadingScreen label="Checking session..." />;
  }

  if (user) {
    return (
      <Navigate
        to={resolvePostAuthRoute({ user, profile })}
        replace
      />
    );
  }

  return children;
}
