import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import {
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

export default function NGOTaskDetailModal({
  isOpen,
  task,
  assignmentStatus,
  isLoading,
  isUpdating,
  detailError,
  actionError,
  onClose,
  onAccept,
  onDecline,
  onMarkInProgress,
  onMarkCompleted,
}) {
  const [declineReason, setDeclineReason] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDeclineReason("");
    setLocalError("");
  }, [isOpen, task?._id]);

  const statusLabel = NGO_TASK_STATUS_LABELS[assignmentStatus] || assignmentStatus || "Pending";
  const statusTone = NGO_TASK_STATUS_TONE[assignmentStatus] || "border-auth-border bg-auth-bg text-auth-text";

  const lifecycle = useMemo(() => {
    if (assignmentStatus === "assigned") {
      return {
        canAccept: true,
        canDecline: true,
        canMarkInProgress: false,
        canMarkCompleted: false,
      };
    }

    if (assignmentStatus === "accepted") {
      return {
        canAccept: false,
        canDecline: false,
        canMarkInProgress: true,
        canMarkCompleted: false,
      };
    }

    if (assignmentStatus === "in-progress") {
      return {
        canAccept: false,
        canDecline: false,
        canMarkInProgress: false,
        canMarkCompleted: true,
      };
    }

    return {
      canAccept: false,
      canDecline: false,
      canMarkInProgress: false,
      canMarkCompleted: false,
    };
  }, [assignmentStatus]);

  if (!isOpen) {
    return null;
  }

  const handleAccept = async () => {
    setLocalError("");

    try {
      await onAccept(task?._id);
    } catch (error) {
      setLocalError(error.message || "Could not accept the task.");
    }
  };

  const handleDecline = async () => {
    setLocalError("");

    try {
      await onDecline(task?._id, declineReason);
    } catch (error) {
      setLocalError(error.message || "Could not decline the task.");
    }
  };

  const handleMarkInProgress = async () => {
    setLocalError("");

    try {
      await onMarkInProgress(task?._id);
    } catch (error) {
      setLocalError(error.message || "Could not update the task status.");
    }
  };

  const handleMarkCompleted = async () => {
    setLocalError("");

    try {
      await onMarkCompleted(task?._id);
    } catch (error) {
      setLocalError(error.message || "Could not complete the task.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-h-[90vh] max-w-3xl overflow-auto rounded-2xl border border-auth-border bg-auth-surface shadow-xl">
        <div className="sticky top-0 z-10 border-b border-auth-border bg-auth-surface px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Task Context</p>
              <h2 className="mt-1 text-xl font-bold text-auth-text">{task?.name || "Help request"}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-auth-border bg-auth-bg p-2 text-auth-text-soft transition hover:text-auth-text"
              aria-label="Close task details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {isLoading ? (
            <div className="rounded-xl border border-auth-border bg-auth-bg p-4 text-sm text-auth-text-soft">
              Loading full task context...
            </div>
          ) : null}

          {detailError ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {detailError}
            </p>
          ) : null}

          {!isLoading && task ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
                  {statusLabel}
                </span>
                <span className="rounded-full border border-auth-border bg-auth-bg px-3 py-1 text-xs font-semibold text-auth-text-soft">
                  {(task.disasterType || "other").toUpperCase()}
                </span>
                <span className="rounded-full border border-auth-border bg-auth-bg px-3 py-1 text-xs font-semibold text-auth-text-soft">
                  {(task.urgency || "low").toUpperCase()} PRIORITY
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-auth-border bg-auth-bg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Citizen Name</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-auth-text">
                    <UserRound className="h-4 w-4 text-auth-text-soft" />
                    {task.name || "Unknown requester"}
                  </p>
                </div>

                <div className="rounded-xl border border-auth-border bg-auth-bg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Contact Info</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-auth-text">
                    <Phone className="h-4 w-4 text-auth-text-soft" />
                    {task.contactNumber || "No contact number"}
                  </p>
                </div>

                <div className="rounded-xl border border-auth-border bg-auth-bg p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Exact Location</p>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-auth-text">
                    <MapPin className="mt-0.5 h-4 w-4 text-auth-text-soft" />
                    {task.realLocation || task.location || "No exact location provided"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-auth-border bg-auth-bg p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-auth-text">
                  {task.message || "No message provided."}
                </p>
                {task.translatedMessage ? (
                  <p className="mt-3 rounded-lg border border-auth-border bg-white px-3 py-2 text-sm text-auth-text-soft">
                    Translated: {task.translatedMessage}
                  </p>
                ) : null}
              </div>

              {task.adminNotes ? (
                <div className="rounded-xl border border-auth-border bg-auth-bg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Admin Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-auth-text">{task.adminNotes}</p>
                </div>
              ) : null}

              <div className="grid gap-3 text-xs text-auth-text-muted sm:grid-cols-2">
                <p>Created: {formatDate(task.createdAt)}</p>
                <p>Last Updated: {formatDate(task.updatedAt)}</p>
              </div>

              <div className="rounded-xl border border-auth-border bg-white p-4">
                <h3 className="text-sm font-semibold text-auth-text">Update Status</h3>
                <p className="mt-1 text-xs text-auth-text-soft">
                  Actions are enabled only when the backend status transition is valid.
                </p>

                {(actionError || localError) ? (
                  <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {localError || actionError}
                  </p>
                ) : null}

                {lifecycle.canDecline ? (
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
                      Decline reason (optional)
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(event) => setDeclineReason(event.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-xl border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none transition focus:border-primary"
                      placeholder="Share a reason if your team cannot take this task now"
                      disabled={isUpdating}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {lifecycle.canAccept ? (
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={isUpdating}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Updating..." : "Accept Task"}
                    </button>
                  ) : null}

                  {lifecycle.canDecline ? (
                    <button
                      type="button"
                      onClick={handleDecline}
                      disabled={isUpdating}
                      className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Updating..." : "Decline Task"}
                    </button>
                  ) : null}

                  {lifecycle.canMarkInProgress ? (
                    <button
                      type="button"
                      onClick={handleMarkInProgress}
                      disabled={isUpdating}
                      className="rounded-xl bg-warning px-4 py-2 text-sm font-semibold text-auth-text transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Updating..." : "Mark In Progress"}
                    </button>
                  ) : null}

                  {lifecycle.canMarkCompleted ? (
                    <button
                      type="button"
                      onClick={handleMarkCompleted}
                      disabled={isUpdating}
                      className="rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Updating..." : "Mark as Resolved"}
                    </button>
                  ) : null}

                  {!lifecycle.canAccept
                    && !lifecycle.canDecline
                    && !lifecycle.canMarkInProgress
                    && !lifecycle.canMarkCompleted ? (
                    <p className="inline-flex items-center gap-2 rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs text-auth-text-soft">
                      <ShieldAlert className="h-4 w-4" />
                      This task is already in a terminal status for your NGO.
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
