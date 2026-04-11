import React, { useEffect, useState } from "react";
import { ADMIN_TASK_STATUS_OPTIONS } from "../../constants/adminTaskConstants";

export default function AdminTaskEditPanel({ isOpen, task, onClose, onSave }) {
  const [status, setStatus] = useState("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [publishedToSocial, setPublishedToSocial] = useState(false);
  const [taskType, setTaskType] = useState("General Relief");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen || !task) {
      return;
    }

    setStatus(task.status || "pending");
    setAdminNotes(task.adminNotes || "");
    setRejectionReason(task.rejectionReason || "");
    setPublishedToSocial(Boolean(task.publishedToSocial));
    setTaskType(task.assignments?.[0]?.taskType || "General Relief");
    setIsSubmitting(false);
    setLocalError("");
  }, [isOpen, task]);

  if (!isOpen || !task) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "rejected" && !rejectionReason.trim()) {
      setLocalError("Rejection reason is required when status is rejected.");
      return;
    }

    setLocalError("");
    setIsSubmitting(true);

    try {
      await onSave(task, {
        status,
        adminNotes,
        rejectionReason: status === "rejected" ? rejectionReason : "",
        publishedToSocial,
        taskType,
      });
      onClose();
    } catch (error) {
      setLocalError(error.message || "Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-surface-container-high p-5 ghost-outline shadow-ambient">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Edit Help Request</h3>
            <p className="mt-1 text-sm text-on-surface/80">
              Update admin-controlled fields for this request.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface-variant px-3 py-1 text-sm text-on-surface"
          >
            Close
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-on-surface/70">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
              >
                {ADMIN_TASK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-on-surface/70">Task Type</label>
              <input
                type="text"
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
                className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
              />
              <p className="mt-1 text-[11px] text-on-surface/60">
                API supports task type during assignment. Keep this value ready for future assignments.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-on-surface/70">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
              placeholder="Internal notes for audit and follow-up"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-on-surface/70">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={2}
              className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
              placeholder="Required when status is rejected"
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={publishedToSocial}
              onChange={(event) => setPublishedToSocial(event.target.checked)}
              className="h-4 w-4 rounded border border-primary/50"
            />
            Publish this request to social channels
          </label>

          {localError && (
            <p className="rounded-xl bg-danger/20 px-3 py-2 text-xs text-danger">{localError}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-surface-variant px-4 py-2 text-sm font-semibold text-on-surface"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
