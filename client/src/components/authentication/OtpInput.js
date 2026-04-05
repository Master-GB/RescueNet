import React from "react";

export default function OtpInput({
  value,
  onChange,
  disabled = false,
}) {
  const handleChange = (event) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(numericValue);
  };

  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.08em] text-secondary">
        Verification Code
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Enter 6-digit code"
        className="focus-ghost w-full rounded-lg bg-surface-container-highest px-4 py-3 text-center text-xl tracking-[0.35em] text-on-surface outline-none placeholder:tracking-normal placeholder:text-sm placeholder:text-on-surface"
      />
      <span className="mt-1 block text-xs text-on-surface opacity-80">
        Enter the six digit code sent to your registered email.
      </span>
    </label>
  );
}
