import React from "react";

const variantStyles = {
  info: {
    backgroundColor: "var(--surface-container-high)",
    color: "var(--secondary)",
  },
  success: {
    backgroundColor: "var(--surface-container-high)",
    color: "var(--primary)",
  },
  warning: {
    backgroundColor: "var(--surface-container-high)",
    color: "var(--warning)",
  },
  error: {
    backgroundColor: "var(--surface-container-high)",
    color: "var(--danger)",
  },
};

export default function AuthAlert({
  message,
  variant = "info",
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="rounded-lg px-4 py-3 text-sm ghost-outline"
      style={variantStyles[variant] || variantStyles.info}
    >
      {message}
    </div>
  );
}
