import React, { memo, useCallback } from "react";
import { Eye, FilePenLine, Loader2, ShieldCheck, Trash2 } from "lucide-react";

const APPROVAL_TONE = {
  pending: "bg-auth-warning-bg text-auth-text border-auth-warning-border",
  approved: "bg-auth-success-bg text-auth-text border-auth-success-border",
  rejected: "bg-auth-danger-bg text-auth-text border-auth-danger-border",
  suspended: "bg-auth-danger-bg text-auth-text border-auth-danger-border",
};

const AVAILABILITY_TONE = {
  AVAILABLE: "bg-auth-success-bg text-auth-text border-auth-success-border",
  BUSY: "bg-auth-warning-bg text-auth-text border-auth-warning-border",
  OFFLINE: "bg-auth-border-subtle text-auth-text border-auth-border",
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

const getEmail = (ngo) => ngo.officialEmail || ngo.userId?.email || "-";

const getOrgName = (ngo) => (
  ngo.organizationName
  || ngo.userId?.name
  || ngo.contactPerson
  || ngo.registrationNumber
  || "Unknown NGO"
);

const TableLoader = memo(function TableLoader() {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-auth-border bg-auth-surface shadow-sm">
      <div className="inline-flex items-center gap-2 text-auth-text-soft">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading NGO profiles...
      </div>
    </div>
  );
});

const AdminNgoTableRow = memo(function AdminNgoTableRow({
  ngo,
  rowActionState,
  onView,
  onEdit,
  onReview,
  onVerify,
  onDelete,
}) {
  const handleView = useCallback(() => {
    onView(ngo);
  }, [ngo, onView]);

  const handleEdit = useCallback(() => {
    onEdit(ngo);
  }, [ngo, onEdit]);

  const handleReview = useCallback(() => {
    onReview(ngo);
  }, [ngo, onReview]);

  const handleVerify = useCallback(() => {
    onVerify(ngo);
  }, [ngo, onVerify]);

  const handleDelete = useCallback(() => {
    onDelete(ngo);
  }, [ngo, onDelete]);

  const approvalTone = APPROVAL_TONE[ngo.approvalStatus] || "bg-auth-border-subtle text-auth-text border-auth-border";
  const availabilityTone = AVAILABILITY_TONE[ngo.availabilityStatus] || "bg-auth-border-subtle text-auth-text border-auth-border";
  const isPending = ngo.approvalStatus === "pending";

  return (
    <tr className="border-b border-auth-border last:border-b-0 hover:bg-auth-border-subtle/60">
      <td className="px-4 py-3 align-top text-sm text-auth-text">
        <p className="font-semibold text-auth-text-strong">{getOrgName(ngo)}</p>
        <p className="mt-1 text-xs text-auth-text-soft">{ngo.contactPerson || "No contact person"}</p>
      </td>
      <td className="px-4 py-3 align-top text-sm text-auth-text">{ngo.registrationNumber || "-"}</td>
      <td className="px-4 py-3 align-top text-sm text-auth-text">{ngo.type || "-"}</td>
      <td className="px-4 py-3 align-top">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${approvalTone}`}>
          {ngo.approvalStatus || "unknown"}
        </span>
      </td>
      <td className="px-4 py-3 align-top">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${availabilityTone}`}>
          {ngo.availabilityStatus || "unknown"}
        </span>
      </td>
      <td className="px-4 py-3 align-top text-sm text-auth-text">{getEmail(ngo)}</td>
      <td className="px-4 py-3 align-top text-xs text-auth-text-soft">{formatDate(ngo.createdAt)}</td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleView}
            className="rounded-lg border border-auth-border bg-auth-bg px-2.5 py-1.5 text-xs font-semibold text-auth-text transition hover:bg-auth-border-subtle"
          >
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              View
            </span>
          </button>

          <button
            type="button"
            onClick={handleEdit}
            className="rounded-lg border border-auth-border bg-auth-bg px-2.5 py-1.5 text-xs font-semibold text-auth-text transition hover:bg-auth-border-subtle"
          >
            <span className="inline-flex items-center gap-1">
              <FilePenLine className="h-3.5 w-3.5" />
              Edit
            </span>
          </button>

          {isPending ? (
            <button
              type="button"
              onClick={handleReview}
              className="rounded-lg border border-auth-warning-border bg-auth-warning-bg px-2.5 py-1.5 text-xs font-semibold text-auth-text transition hover:opacity-90"
            >
              Review
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleVerify}
            disabled={ngo.verifiedByAdmin || rowActionState.isVerifying || !ngo.userId?._id}
            className="rounded-lg border border-auth-success-border bg-auth-success-bg px-2.5 py-1.5 text-xs font-semibold text-auth-text transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-1">
              {rowActionState.isVerifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              {ngo.verifiedByAdmin ? "Verified" : "Verify"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={rowActionState.isDeleting}
            className="rounded-lg border border-auth-danger-border bg-auth-danger-bg px-2.5 py-1.5 text-xs font-semibold text-auth-text transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-1">
              {rowActionState.isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
});

function AdminNgoTable({
  ngos,
  isLoading,
  actionStateById,
  onView,
  onEdit,
  onReview,
  onVerify,
  onDelete,
}) {
  if (isLoading) {
    return <TableLoader />;
  }

  if (!ngos.length) {
    return (
      <section className="rounded-2xl border border-auth-border bg-auth-surface p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-auth-text">No Data Found</h2>
        <p className="mt-2 text-sm text-auth-text-soft">
          No NGO profiles matched the current filters.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-auth-border bg-auth-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full">
          <thead className="bg-auth-border-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Organization</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Registration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Availability</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ngos.map((ngo) => (
              <AdminNgoTableRow
                key={ngo._id}
                ngo={ngo}
                rowActionState={actionStateById[ngo._id] || {}}
                onView={onView}
                onEdit={onEdit}
                onReview={onReview}
                onVerify={onVerify}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(AdminNgoTable);
