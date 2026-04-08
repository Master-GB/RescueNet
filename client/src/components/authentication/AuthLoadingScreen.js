import React from "react";

export default function AuthLoadingScreen({ label = "Loading session..." }) {
  return (
    <div className="min-h-screen bg-auth-bg text-auth-text-strong flex items-center justify-center px-4">
      <div className="bg-auth-surface border border-auth-border rounded-2xl px-6 py-5 shadow-sm flex items-center gap-3">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-b-transparent" />
        <p className="text-sm font-medium tracking-wide text-auth-text-soft">{label}</p>
      </div>
    </div>
  );
}
