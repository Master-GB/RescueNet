import React from "react";

const variantClasses = {
  primary:
    "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-ambient",
  secondary:
    "bg-transparent text-primary ghost-outline hover:bg-surface-container-high",
  tertiary:
    "bg-transparent text-primary hover:underline underline-offset-4",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const baseClasses =
    "focus-ghost rounded-lg px-4 py-2 transition-colors duration-200";
  const appliedVariant = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      className={`${baseClasses} ${appliedVariant} ${className}`}
      {...props}
    />
  );
}
