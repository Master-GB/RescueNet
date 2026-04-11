import React, { useCallback, useMemo } from "react";
import { Loader2, X } from "lucide-react";

const toText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

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

export default function AdminNgoDetailDrawer({ isOpen, ngo, isLoading, onClose }) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const servicesText = useMemo(() => {
    if (!Array.isArray(ngo?.services) || ngo.services.length === 0) {
      return "-";
    }

    return ngo.services.join(", ");
  }, [ngo?.services]);

  const districtsText = useMemo(() => {
    if (!Array.isArray(ngo?.serviceDistricts) || ngo.serviceDistricts.length === 0) {
      return "-";
    }

    return ngo.serviceDistricts.join(", ");
  }, [ngo?.serviceDistricts]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1600] bg-black/40">
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 h-full w-full"
        onClick={handleClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-auth-border bg-auth-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">NGO Profile</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-auth-text-strong">
              {ngo?.organizationName || "NGO details"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-auth-border bg-auth-bg p-2 text-auth-text transition hover:bg-auth-border-subtle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-auth-border bg-auth-bg p-10">
            <div className="inline-flex items-center gap-2 text-auth-text-soft">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading NGO profile...
            </div>
          </div>
        ) : !ngo ? (
          <div className="mt-8 rounded-2xl border border-auth-border bg-auth-bg p-10 text-center">
            <h3 className="text-lg font-semibold text-auth-text">No Data Found</h3>
            <p className="mt-2 text-sm text-auth-text-soft">Could not load the selected NGO profile.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <section className="rounded-2xl border border-auth-border bg-auth-bg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Organization</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-auth-text-soft">Organization Name</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.organizationName)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Registration Number</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.registrationNumber)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Type</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.type)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Availability</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.availabilityStatus)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Approval Status</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.approvalStatus)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Verified By Admin</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{ngo.verifiedByAdmin ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-auth-border bg-auth-bg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Contacts</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-auth-text-soft">Contact Person</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.contactPerson)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Official Email</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.officialEmail || ngo.userId?.email)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Contact Phone</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.contactPhone)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Alternate Phone</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.alternatePhone)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-auth-border bg-auth-bg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Address</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-auth-text-soft">Street</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.address?.street)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">City</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.address?.city)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Province</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.address?.province)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Postal Code</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.address?.postalCode)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-auth-border bg-auth-bg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Operations</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-auth-text-soft">Services</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{servicesText}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Service Districts</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{districtsText}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Notes</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.notes)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Rejection Reason</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.rejectionReason)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-auth-border bg-auth-bg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Linked User</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-auth-text-soft">Name</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.userId?.name)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Email</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.userId?.email)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Role</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{toText(ngo.userId?.role)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-auth-text-soft">Created At</dt>
                  <dd className="mt-1 text-sm font-medium text-auth-text">{formatDate(ngo.createdAt)}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
