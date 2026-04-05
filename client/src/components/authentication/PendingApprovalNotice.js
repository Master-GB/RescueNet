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
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-container-high p-5 ghost-outline">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-on-surface opacity-80">{message}</p>
      </div>

      {details.length > 0 ? (
        <ul className="space-y-2 rounded-xl bg-surface-container-low p-5 ghost-outline text-sm text-on-surface opacity-80">
          {details.map((item) => (
            <li key={item}>• {item}</li>
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
