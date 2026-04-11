import React, { memo } from "react";
import { MapPin, Phone, TriangleAlert } from "lucide-react";
import {
  NGO_TASK_PRIORITY_TONE,
  NGO_TASK_STATUS_LABELS,
  NGO_TASK_STATUS_TONE,
} from "../../constants/ngoTaskConstants";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const resolvePriorityKey = (urgency = "") => {
  const normalized = String(urgency || "").toLowerCase();
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  return "low";
};

function NGOTaskCard({ task, assignmentStatus, onOpenDetails, isUpdating }) {
  const priorityKey = resolvePriorityKey(task?.urgency);
  const priorityTone = NGO_TASK_PRIORITY_TONE[priorityKey] || NGO_TASK_PRIORITY_TONE.low;
  const statusTone = NGO_TASK_STATUS_TONE[assignmentStatus] || "border-auth-border bg-auth-bg text-auth-text";
  const statusLabel = NGO_TASK_STATUS_LABELS[assignmentStatus] || assignmentStatus || "Pending";

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-auth-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${priorityTone.cardBorder}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${priorityTone.topAccent}`} />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-auth-text">{task?.name || "Unknown requester"}</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold ${priorityTone.badge}`}>
          <TriangleAlert className="h-3.5 w-3.5" />
          {priorityTone.label} Priority
        </span>
        <span className="rounded-full border border-auth-border bg-auth-bg px-3 py-1 text-auth-text-soft">
          {(task?.disasterType || "other").toUpperCase()}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-auth-text">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-auth-text-soft" />
          <span>{task?.realLocation || task?.location || "No location provided"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-auth-text-soft" />
          <span>{task?.contactNumber || "No contact number"}</span>
        </p>
        <p className="line-clamp-3 text-auth-text-soft">{task?.message || "No message provided."}</p>
      </div>

      <p className="mt-3 text-xs text-auth-text-muted">Created: {formatDate(task?.createdAt)}</p>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => onOpenDetails(task)}
          disabled={isUpdating}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUpdating ? "Updating task..." : "View Task"}
        </button>
      </div>
    </article>
  );
}

export default memo(NGOTaskCard);
