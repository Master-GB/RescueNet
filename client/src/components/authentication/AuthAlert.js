import React from "react";

const variantStyles = {
  info: {
    backgroundColor: "var(--auth-bg)",
    color: "var(--secondary-container)",
    border: "1px solid var(--auth-border)",
  },
  success: {
    backgroundColor: "var(--auth-success-bg)",
    color: "var(--primary-container)",
    border: "1px solid var(--auth-success-border)",
  },
  warning: {
    backgroundColor: "var(--auth-warning-bg)",
    color: "var(--warning)",
    border: "1px solid var(--auth-warning-border)",
  },
  error: {
    backgroundColor: "var(--auth-danger-bg)",
    color: "var(--danger)",
    border: "1px solid var(--auth-danger-border)",
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
      className="rounded-lg px-4 py-3 text-sm font-medium"
      style={variantStyles[variant] || variantStyles.info}
    >
      {message}
    </div>
  );
}
