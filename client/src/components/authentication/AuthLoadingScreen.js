import React from "react";

export default function AuthLoadingScreen({ label = "Loading session..." }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-4">
      <div className="glass-panel rounded-2xl px-6 py-5 shadow-ambient flex items-center gap-3">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-b-transparent" />
        <p className="text-sm tracking-wide">{label}</p>
      </div>
    </div>
  );
}
