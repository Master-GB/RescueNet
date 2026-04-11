import React from "react";
import Button from "../ui/Button";

export default function PendingApprovalNotice({
  title,
  message,
  details = [],
  onRefresh,
  refreshing = false,
}) {
  return (
    <div className="space-y-4 text-auth-text-strong">
      <div className="rounded-xl bg-auth-bg border border-auth-border p-6">
        <h2 className="text-xl font-bold text-auth-text">{title}</h2>
        <p className="mt-3 text-sm text-auth-text-soft leading-relaxed">{message}</p>
      </div>

      {details.length > 0 ? (
        <ul className="space-y-3 rounded-xl bg-auth-surface border border-auth-border-subtle p-6 text-sm text-auth-text-soft">
          {details.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-primary-container font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <Button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="w-full py-3 font-semibold disabled:opacity-70"
      >
        {refreshing ? "Refreshing status..." : "Refresh Approval Status"}
      </Button>
    </div>
  );
}
