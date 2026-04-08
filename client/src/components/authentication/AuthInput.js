import React from "react";

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  maxLength,
  error,
  hint,
  disabled = false,
  className = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.08em] text-secondary-container font-semibold">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        className={`focus-ghost w-full rounded-lg bg-auth-bg border border-auth-border px-4 py-3 text-sm text-auth-text outline-none transition placeholder:text-auth-placeholder focus:bg-auth-surface focus:border-primary-container ${
          error ? "border-danger bg-auth-danger-bg" : ""
        } ${className}`}
      />
      {error ? (
        <span className="mt-2 block text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
      {!error && hint ? (
        <span className="mt-2 block text-xs text-auth-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
