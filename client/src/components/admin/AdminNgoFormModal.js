import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";

const NGO_TYPE_OPTIONS = [
  { value: "", label: "Select type" },
  { value: "food-bank", label: "Food Bank" },
  { value: "medical", label: "Medical" },
  { value: "shelter", label: "Shelter" },
  { value: "rescue", label: "Rescue" },
  { value: "relief", label: "Relief" },
  { value: "other", label: "Other" },
];

const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "OFFLINE", label: "Offline" },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const EMPTY_FORM = {
  userEmail: "",
  organizationName: "",
  registrationNumber: "",
  type: "",
  contactPerson: "",
  officialEmail: "",
  contactPhone: "",
  alternatePhone: "",
  approvalStatus: "pending",
  availabilityStatus: "AVAILABLE",
  servicesInput: "",
  serviceDistrictsInput: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  notes: "",
  rejectionReason: "",
  isActive: true,
};

const arrayToInput = (value) => {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.join(", ");
};

const parseArrayInput = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildFormState = (ngo) => {
  if (!ngo) {
    return EMPTY_FORM;
  }

  return {
    userEmail: ngo.userEmail || ngo.userId?.email || "",
    organizationName: ngo.organizationName || "",
    registrationNumber: ngo.registrationNumber || "",
    type: ngo.type || "",
    contactPerson: ngo.contactPerson || "",
    officialEmail: ngo.officialEmail || ngo.userId?.email || "",
    contactPhone: ngo.contactPhone || "",
    alternatePhone: ngo.alternatePhone || "",
    approvalStatus: ngo.approvalStatus || "pending",
    availabilityStatus: ngo.availabilityStatus || "AVAILABLE",
    servicesInput: arrayToInput(ngo.services),
    serviceDistrictsInput: arrayToInput(ngo.serviceDistricts),
    street: ngo.address?.street || "",
    city: ngo.address?.city || "",
    province: ngo.address?.province || "",
    postalCode: ngo.address?.postalCode || "",
    notes: ngo.notes || "",
    rejectionReason: ngo.rejectionReason || "",
    isActive: ngo.isActive !== false,
  };
};

const buildPayload = (formValues, mode, reviewDecision) => {
  const payload = {
    organizationName: formValues.organizationName.trim(),
    registrationNumber: formValues.registrationNumber.trim(),
    type: formValues.type || undefined,
    contactPerson: formValues.contactPerson.trim(),
    officialEmail: formValues.officialEmail.trim(),
    contactPhone: formValues.contactPhone.trim(),
    alternatePhone: formValues.alternatePhone.trim(),
    services: parseArrayInput(formValues.servicesInput),
    serviceDistricts: parseArrayInput(formValues.serviceDistrictsInput),
    availabilityStatus: formValues.availabilityStatus,
    isActive: Boolean(formValues.isActive),
    notes: formValues.notes.trim(),
  };

  const address = {
    street: formValues.street.trim(),
    city: formValues.city.trim(),
    province: formValues.province.trim(),
    postalCode: formValues.postalCode.trim(),
  };

  const hasAddress = Object.values(address).some(Boolean);
  if (hasAddress) {
    payload.address = address;
  }

  if (mode === "register") {
    payload.userEmail = formValues.userEmail.trim().toLowerCase();
  }

  if (mode === "review") {
    payload.approvalStatus = reviewDecision || formValues.approvalStatus || "approved";
  } else {
    payload.approvalStatus = formValues.approvalStatus;
  }

  if (payload.approvalStatus === "rejected") {
    payload.rejectionReason = formValues.rejectionReason.trim();
  } else {
    payload.rejectionReason = "";
  }

  return payload;
};

const getModalTitle = (mode) => {
  if (mode === "register") {
    return "Register NGO Profile";
  }

  if (mode === "review") {
    return "Review Pending NGO";
  }

  return "Edit NGO Profile";
};

const getSubmitLabel = (mode, reviewDecision) => {
  if (mode === "register") {
    return "Create NGO Profile";
  }

  if (mode === "review") {
    if (reviewDecision === "rejected") {
      return "Reject NGO";
    }

    return "Approve NGO";
  }

  return "Save Changes";
};

export default function AdminNgoFormModal({
  isOpen,
  mode,
  ngo,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [reviewDecision, setReviewDecision] = useState("approved");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initialState = buildFormState(ngo);
    setFormValues(initialState);
    setReviewDecision(mode === "review" ? "approved" : initialState.approvalStatus || "pending");
    setLocalError("");
  }, [isOpen, mode, ngo]);

  const showReviewActions = mode === "review" && formValues.approvalStatus === "pending";
  const effectiveStatus = useMemo(() => {
    if (showReviewActions) {
      return reviewDecision;
    }

    return formValues.approvalStatus;
  }, [formValues.approvalStatus, reviewDecision, showReviewActions]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleCheckboxChange = useCallback((event) => {
    const { checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      isActive: checked,
    }));
  }, []);

  const handleDecision = useCallback((decision) => {
    setReviewDecision(decision);
    setFormValues((prev) => ({
      ...prev,
      approvalStatus: decision,
    }));
  }, []);

  const handleApproveDecision = useCallback(() => {
    handleDecision("approved");
  }, [handleDecision]);

  const handleRejectDecision = useCallback(() => {
    handleDecision("rejected");
  }, [handleDecision]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setLocalError("");

    const payload = buildPayload(formValues, mode, reviewDecision);

    if (mode === "register" && !payload.userEmail) {
      setLocalError("Existing user email is required for manual NGO registration.");
      return;
    }

    if (!payload.registrationNumber) {
      setLocalError("Registration number is required.");
      return;
    }

    if (!payload.contactPhone) {
      setLocalError("Contact phone is required.");
      return;
    }

    if (payload.approvalStatus === "rejected" && !payload.rejectionReason) {
      setLocalError("Rejection reason is required when rejecting an NGO.");
      return;
    }

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setLocalError(submitError.message || "Failed to submit NGO changes.");
    }
  }, [formValues, mode, onSubmit, reviewDecision]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1700] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-auth-border bg-auth-surface shadow-xl">
        <div className="flex items-start justify-between border-b border-auth-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Admin NGO Action</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-auth-text-strong">{getModalTitle(mode)}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-auth-border bg-auth-bg p-2 text-auth-text transition hover:bg-auth-border-subtle"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-5">
          {showReviewActions ? (
            <section className="mb-4 rounded-xl border border-auth-warning-border bg-auth-warning-bg p-3">
              <p className="text-sm font-semibold text-auth-text">Pending NGO Review</p>
              <p className="mt-1 text-xs text-auth-text-soft">
                Choose Approve or Reject. Rejection requires a reason.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApproveDecision}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    reviewDecision === "approved"
                      ? "bg-primary text-on-primary"
                      : "border border-auth-border bg-auth-surface text-auth-text"
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={handleRejectDecision}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    reviewDecision === "rejected"
                      ? "bg-danger text-white"
                      : "border border-auth-border bg-auth-surface text-auth-text"
                  }`}
                >
                  Reject
                </button>
              </div>
            </section>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            {mode === "register" ? (
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Existing User Email</span>
                <input
                  name="userEmail"
                  type="email"
                  value={formValues.userEmail}
                  onChange={handleChange}
                  className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                  placeholder="existing-user@example.com"
                  disabled={isSubmitting}
                  required
                />
              </label>
            ) : null}

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Organization Name</span>
              <input
                name="organizationName"
                value={formValues.organizationName}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Registration Number</span>
              <input
                name="registrationNumber"
                value={formValues.registrationNumber}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">NGO Type</span>
              <select
                name="type"
                value={formValues.type}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              >
                {NGO_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || "none"} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Availability</span>
              <select
                name="availabilityStatus"
                value={formValues.availabilityStatus}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Contact Person</span>
              <input
                name="contactPerson"
                value={formValues.contactPerson}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Official Email</span>
              <input
                name="officialEmail"
                type="email"
                value={formValues.officialEmail}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Contact Phone</span>
              <input
                name="contactPhone"
                value={formValues.contactPhone}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Alternate Phone</span>
              <input
                name="alternatePhone"
                value={formValues.alternatePhone}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Services</span>
              <input
                name="servicesInput"
                value={formValues.servicesInput}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                placeholder="FOOD, MEDICAL, TRANSPORT"
                disabled={isSubmitting}
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Service Districts</span>
              <input
                name="serviceDistrictsInput"
                value={formValues.serviceDistrictsInput}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                placeholder="Colombo, Gampaha"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Street</span>
              <input
                name="street"
                value={formValues.street}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">City</span>
              <input
                name="city"
                value={formValues.city}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Province</span>
              <input
                name="province"
                value={formValues.province}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Postal Code</span>
              <input
                name="postalCode"
                value={formValues.postalCode}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Approval Status</span>
              <select
                name="approvalStatus"
                value={effectiveStatus}
                onChange={handleChange}
                disabled={isSubmitting || showReviewActions}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {APPROVAL_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 self-end rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text">
              <input
                type="checkbox"
                checked={formValues.isActive}
                onChange={handleCheckboxChange}
                disabled={isSubmitting}
              />
              Active Profile
            </label>

            {(effectiveStatus === "rejected" || reviewDecision === "rejected") ? (
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Rejection Reason</span>
                <textarea
                  name="rejectionReason"
                  rows={3}
                  value={formValues.rejectionReason}
                  onChange={handleChange}
                  className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                  disabled={isSubmitting}
                  placeholder="Explain why this NGO is rejected"
                />
              </label>
            ) : null}

            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Admin Notes</span>
              <textarea
                name="notes"
                rows={3}
                value={formValues.notes}
                onChange={handleChange}
                className="focus-ghost w-full rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text outline-none"
                disabled={isSubmitting}
              />
            </label>
          </div>

          {localError ? (
            <p className="mt-4 rounded-lg border border-auth-danger-border bg-auth-danger-bg px-3 py-2 text-sm text-auth-text">
              {localError}
            </p>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-auth-border pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-auth-border bg-auth-bg px-4 py-2 text-sm font-semibold text-auth-text transition hover:bg-auth-border-subtle"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Submitting..." : getSubmitLabel(mode, reviewDecision)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
