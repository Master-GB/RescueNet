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
      <span className="mb-2 block text-xs uppercase tracking-[0.08em] text-secondary">
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
        className={`focus-ghost w-full rounded-lg bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface ${
          error ? "ghost-outline" : ""
        } ${className}`}
      />
      {error ? (
        <span className="mt-1 block text-xs" style={{ color: "var(--danger)" }}>
          {error}
        </span>
      ) : null}
      {!error && hint ? (
        <span className="mt-1 block text-xs text-on-surface opacity-80">{hint}</span>
      ) : null}
    </label>
  );
}
