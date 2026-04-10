import React, { useEffect, useMemo, useState } from "react";

const getNgoDisplayName = (ngo = {}) => {
  return (
    ngo.organizationName
    || ngo.userId?.name
    || ngo.contactPerson
    || ngo.registrationNumber
    || "Unknown NGO"
  );
};

export default function AdminAssignTaskModal({
  isOpen,
  task,
  ngos,
  isNgosLoading,
  onClose,
  onAssign,
}) {
  const [selectedNgoId, setSelectedNgoId] = useState("");
  const [taskType, setTaskType] = useState("General Relief");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [localError, setLocalError] = useState("");

  const selectedNgo = useMemo(() => {
    return ngos.find((ngo) => ngo._id === selectedNgoId);
  }, [ngos, selectedNgoId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedNgoId("");
    setTaskType("General Relief");
    setLocalError("");
    setIsSubmitting(false);
    setIsConfirming(false);
  }, [isOpen, task?._id]);

  if (!isOpen || !task) {
    return null;
  }

  const handleContinue = () => {
    if (!selectedNgoId) {
      setLocalError("Please select an NGO before continuing.");
      return;
    }

    setLocalError("");
    setIsConfirming(true);
  };

  const handleAssign = async () => {
    if (!selectedNgoId) {
      setLocalError("Please select an NGO before assigning.");
      return;
    }

    setIsSubmitting(true);
    setLocalError("");

    try {
      await onAssign(task, {
        organizationId: selectedNgoId,
        taskType,
      });
      onClose();
    } catch (error) {
      setLocalError(error.message || "Failed to assign task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-surface-container-high p-5 ghost-outline shadow-ambient">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Assign Task</h3>
            <p className="mt-1 text-sm text-on-surface/80">
              Assign this request to an approved NGO.
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

        <div className="mt-4 rounded-xl bg-surface-container-low p-3 text-sm text-on-surface/90">
          <p className="font-semibold">{task.name || "Unknown requester"}</p>
          <p className="mt-1 text-xs text-on-surface/70">{task.location || "No location"}</p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-on-surface/70">NGO</label>
            <select
              value={selectedNgoId}
              onChange={(event) => setSelectedNgoId(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
              disabled={isNgosLoading || isSubmitting}
            >
              <option value="">
                {isNgosLoading ? "Loading NGOs..." : "Select an NGO"}
              </option>
              {ngos.map((ngo) => (
                <option key={ngo._id} value={ngo._id}>
                  {getNgoDisplayName(ngo)} ({ngo.availabilityStatus || "Unknown"})
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
              placeholder="General Relief"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {localError && (
          <p className="mt-3 rounded-xl bg-danger/20 px-3 py-2 text-xs text-danger">{localError}</p>
        )}

        {!isConfirming ? (
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleContinue}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              disabled={isNgosLoading || isSubmitting}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-surface-container-low p-3">
            <p className="text-sm text-on-surface">
              Are you sure to assign this task to
              <span className="font-semibold"> {getNgoDisplayName(selectedNgo)}</span>?
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="rounded-xl bg-surface-variant px-4 py-2 text-sm font-semibold text-on-surface"
                disabled={isSubmitting}
              >
                No
              </button>
              <button
                type="button"
                onClick={handleAssign}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Assigning..." : "Yes, Assign"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
