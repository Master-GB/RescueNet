import React, { memo } from "react";
import { CheckSquare, Eye, FilePenLine, MapPin, Phone } from "lucide-react";
import {
  ADMIN_DISASTER_TONE,
  ADMIN_TASK_STATUS_OPTIONS,
  ADMIN_TASK_STATUS_TONE,
} from "../../constants/adminTaskConstants";

const statusLabelMap = ADMIN_TASK_STATUS_OPTIONS.reduce((map, option) => {
  map[option.value] = option.label;
  return map;
}, {});

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

function AdminTaskCard({ task, onView, onAssign, onEdit }) {
  const statusClass = ADMIN_TASK_STATUS_TONE[task.status] || "bg-surface-variant text-on-surface";
  const disasterTone = ADMIN_DISASTER_TONE[task.disasterType] || ADMIN_DISASTER_TONE.other;
  const assignmentCount = Array.isArray(task.assignments) ? task.assignments.length : 0;

  return (
    <article className="rounded-2xl bg-surface-container-high p-5 ghost-outline shadow-ambient">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-on-surface">{task.name || "Unknown requester"}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
          {statusLabelMap[task.status] || "Unknown"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-3 py-1 ${disasterTone.className}`}>
          {disasterTone.label}
        </span>
        <span className="rounded-full px-3 py-1 bg-surface-variant text-on-surface/90">
          Urgency: {(task.urgency || "unknown").toUpperCase()}
        </span>
        <span className="rounded-full px-3 py-1 bg-surface-variant text-on-surface/90">
          Assigned NGOs: {assignmentCount}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-on-surface/80">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{task.location || "No location"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{task.contactNumber || "No contact"}</span>
        </p>
        <p className="line-clamp-3">{task.message || "No message provided"}</p>
      </div>

      <p className="mt-3 text-xs text-on-surface/60">Created: {formatDate(task.createdAt)}</p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onAssign(task)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/30"
        >
          <CheckSquare className="h-4 w-4" />
          Assign Task
        </button>

        <button
          type="button"
          onClick={() => onView(task)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary/20 px-3 py-2 text-xs font-semibold text-secondary hover:bg-secondary/30"
        >
          <Eye className="h-4 w-4" />
          View
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-variant px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-bright"
        >
          <FilePenLine className="h-4 w-4" />
          Edit Details
        </button>
      </div>
    </article>
  );
}

export default memo(AdminTaskCard);
