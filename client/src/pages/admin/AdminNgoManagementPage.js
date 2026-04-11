import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Loader2, PlusCircle } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import adminSidebarItems from "./adminSidebarItems";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import AdminNgoFilters from "../../components/admin/AdminNgoFilters";
import AdminNgoTable from "../../components/admin/AdminNgoTable";
import AdminNgoDetailDrawer from "../../components/admin/AdminNgoDetailDrawer";
import AdminNgoFormModal from "../../components/admin/AdminNgoFormModal";
import AdminToastRegion from "../../components/admin/AdminToastRegion";
import {
  deleteAdminNgo,
  getAdminNgoById,
  listAdminNgos,
  registerAdminNgo,
  updateAdminNgo,
  verifyAdminNgo,
} from "../../services/adminNgoService";

const FILTER_DEFAULTS = {
  approvalStatus: "",
  type: "",
  availabilityStatus: "",
  page: 1,
  limit: 10,
};

const EMPTY_PAGINATION = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const createToast = (type, title, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
});

const getSearchableText = (ngo) => {
  return [
    ngo?.organizationName,
    ngo?.registrationNumber,
    ngo?.officialEmail,
    ngo?.userId?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const sortNgos = (ngoList, sortBy) => {
  const copy = [...ngoList];

  if (sortBy === "name-asc") {
    return copy.sort((a, b) => (a.organizationName || "").localeCompare(b.organizationName || ""));
  }

  if (sortBy === "name-desc") {
    return copy.sort((a, b) => (b.organizationName || "").localeCompare(a.organizationName || ""));
  }

  if (sortBy === "createdAt-asc") {
    return copy.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  }

  return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
};

const DEFAULT_FORM_STATE = {
  isOpen: false,
  mode: "register",
  ngo: null,
};

const DEFAULT_DETAIL_STATE = {
  isOpen: false,
  isLoading: false,
  ngo: null,
};

export default function AdminNgoManagementPage() {
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [sortBy, setSortBy] = useState("createdAt-desc");

  const [ngos, setNgos] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [isListLoading, setIsListLoading] = useState(false);
  const [error, setError] = useState("");

  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [detailState, setDetailState] = useState(DEFAULT_DETAIL_STATE);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [rowActionStateById, setRowActionStateById] = useState({});
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    setToasts((prev) => [...prev, createToast(type, title, message)]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const setRowActionState = useCallback((ngoId, nextState) => {
    setRowActionStateById((prev) => ({
      ...prev,
      [ngoId]: {
        ...prev[ngoId],
        ...nextState,
      },
    }));
  }, []);

  const loadNgos = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsListLoading(true);
    }

    setError("");

    try {
      const response = await listAdminNgos({
        ...filters,
        q: debouncedSearch.trim() || undefined,
      });

      setNgos(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || EMPTY_PAGINATION);
      return response;
    } catch (loadError) {
      const message = loadError.message || "Could not load NGO profiles.";
      setError(message);
      addToast("error", "Load failed", message);
      throw loadError;
    } finally {
      if (!silent) {
        setIsListLoading(false);
      }
    }
  }, [addToast, debouncedSearch, filters]);

  useEffect(() => {
    loadNgos().catch(() => {});
  }, [loadNgos]);

  const visibleNgos = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();

    const filtered = ngos.filter((ngo) => {
      const matchesSearch = !search || getSearchableText(ngo).includes(search);
      const matchesStatus = !filters.approvalStatus || ngo.approvalStatus === filters.approvalStatus;
      const matchesType = !filters.type || ngo.type === filters.type;
      const matchesAvailability = !filters.availabilityStatus || ngo.availabilityStatus === filters.availabilityStatus;

      return matchesSearch && matchesStatus && matchesType && matchesAvailability;
    });

    return sortNgos(filtered, sortBy);
  }, [debouncedSearch, filters.approvalStatus, filters.availabilityStatus, filters.type, ngos, sortBy]);

  const summary = useMemo(() => {
    return visibleNgos.reduce((acc, ngo) => {
      const status = ngo.approvalStatus || "pending";
      acc.total += 1;
      if (status === "pending") acc.pending += 1;
      if (status === "approved") acc.approved += 1;
      if (status === "rejected") acc.rejected += 1;
      if (status === "suspended") acc.suspended += 1;
      return acc;
    }, {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    });
  }, [visibleNgos]);

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(FILTER_DEFAULTS);
    setSearchInput("");
    setSortBy("createdAt-desc");
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await loadNgos();
      addToast("success", "List refreshed", "NGO list has been refreshed.");
    } catch {
      // Error feedback is already handled inside loadNgos.
    }
  }, [addToast, loadNgos]);

  const handleOpenRegisterModal = useCallback(() => {
    setFormState({
      isOpen: true,
      mode: "register",
      ngo: null,
    });
  }, []);

  const handleOpenEditModal = useCallback((ngo) => {
    setFormState({
      isOpen: true,
      mode: "edit",
      ngo,
    });
  }, []);

  const handleOpenReviewModal = useCallback((ngo) => {
    setFormState({
      isOpen: true,
      mode: "review",
      ngo,
    });
  }, []);

  const handleCloseFormModal = useCallback(() => {
    if (isFormSubmitting) {
      return;
    }

    setFormState(DEFAULT_FORM_STATE);
  }, [isFormSubmitting]);

  const handleSubmitForm = useCallback(async (payload) => {
    setIsFormSubmitting(true);

    try {
      if (formState.mode === "register") {
        await registerAdminNgo(payload);
        addToast("success", "NGO registered", "New NGO profile was created successfully.");
      } else {
        await updateAdminNgo(formState.ngo?._id, payload);
        if (formState.mode === "review") {
          const actionLabel = payload.approvalStatus === "rejected" ? "rejected" : "approved";
          addToast("success", "Review completed", `NGO has been ${actionLabel}.`);
        } else {
          addToast("success", "NGO updated", "NGO profile changes were saved.");
        }
      }

      setFormState(DEFAULT_FORM_STATE);
      await loadNgos({ silent: true });
    } catch (submitError) {
      const message = submitError.message || "Failed to complete NGO action.";
      addToast("error", "Action failed", message);
      throw submitError;
    } finally {
      setIsFormSubmitting(false);
    }
  }, [addToast, formState.mode, formState.ngo?._id, loadNgos]);

  const handleOpenDetails = useCallback(async (ngo) => {
    setDetailState({
      isOpen: true,
      isLoading: true,
      ngo,
    });

    try {
      const response = await getAdminNgoById(ngo._id);
      setDetailState({
        isOpen: true,
        isLoading: false,
        ngo: response?.data || ngo,
      });
    } catch (detailError) {
      addToast("warning", "Detail load failed", detailError.message || "Showing cached NGO details.");
      setDetailState({
        isOpen: true,
        isLoading: false,
        ngo,
      });
    }
  }, [addToast]);

  const handleCloseDetails = useCallback(() => {
    setDetailState(DEFAULT_DETAIL_STATE);
  }, []);

  const handleQuickVerify = useCallback(async (ngo) => {
    if (!ngo?.userId?._id) {
      addToast("warning", "Missing user", "Cannot verify NGO because linked user information is missing.");
      return;
    }

    setRowActionState(ngo._id, { isVerifying: true });

    try {
      await verifyAdminNgo(ngo.userId._id);
      addToast("success", "NGO verified", "NGO verification was updated.");
      await loadNgos({ silent: true });
    } catch (verifyError) {
      addToast("error", "Verification failed", verifyError.message || "Could not verify NGO.");
    } finally {
      setRowActionState(ngo._id, { isVerifying: false });
    }
  }, [addToast, loadNgos, setRowActionState]);

  const handleAskDelete = useCallback((ngo) => {
    setDeleteTarget(ngo);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (isDeleteSubmitting) {
      return;
    }

    setDeleteTarget(null);
  }, [isDeleteSubmitting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?._id) {
      return;
    }

    setIsDeleteSubmitting(true);
    setRowActionState(deleteTarget._id, { isDeleting: true });

    try {
      await deleteAdminNgo(deleteTarget._id);
      addToast("success", "NGO deleted", "NGO profile has been removed successfully.");
      setDeleteTarget(null);
      await loadNgos({ silent: true });
    } catch (deleteError) {
      addToast("error", "Delete failed", deleteError.message || "Could not delete NGO profile.");
    } finally {
      setIsDeleteSubmitting(false);
      setRowActionState(deleteTarget._id, { isDeleting: false });
    }
  }, [addToast, deleteTarget, loadNgos, setRowActionState]);

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  const gotoPage = useCallback((nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  }, [totalPages]);

  const handlePreviousPage = useCallback(() => {
    gotoPage(currentPage - 1);
  }, [currentPage, gotoPage]);

  const handleNextPage = useCallback(() => {
    gotoPage(currentPage + 1);
  }, [currentPage, gotoPage]);

  return (
    <DashboardLayout
      sidebarItems={adminSidebarItems}
      portalTitle="Admin Portal"
      avatarLetter="A"
      homePath="/admin-dashboard"
      searchPlaceholder="Search NGOs, profiles, and registrations..."
      contentClassName="bg-auth-bg"
    >
      <div className="space-y-5 rounded-2xl bg-auth-bg text-auth-text">
        <header className="rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-auth-text-soft">Admin Control</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-auth-text-strong">NGO Management</h1>
              <p className="mt-2 text-sm text-auth-text-soft">
                Manage NGO verification, profile edits, registration, and approval lifecycle from one workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenRegisterModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
            >
              <PlusCircle className="h-4 w-4" />
              Register NGO
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-auth-border bg-auth-surface p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Visible NGOs</p>
            <p className="mt-2 text-2xl font-bold text-auth-text-strong">{summary.total}</p>
          </article>
          <article className="rounded-xl border border-auth-warning-border bg-auth-warning-bg p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Pending</p>
            <p className="mt-2 text-2xl font-bold text-auth-text-strong">{summary.pending}</p>
          </article>
          <article className="rounded-xl border border-auth-success-border bg-auth-success-bg p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Approved</p>
            <p className="mt-2 text-2xl font-bold text-auth-text-strong">{summary.approved}</p>
          </article>
          <article className="rounded-xl border border-auth-danger-border bg-auth-danger-bg p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Rejected</p>
            <p className="mt-2 text-2xl font-bold text-auth-text-strong">{summary.rejected}</p>
          </article>
          <article className="rounded-xl border border-auth-danger-border bg-auth-danger-bg p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Suspended</p>
            <p className="mt-2 text-2xl font-bold text-auth-text-strong">{summary.suspended}</p>
          </article>
        </section>

        <AdminNgoFilters
          searchValue={searchInput}
          filters={filters}
          sortBy={sortBy}
          isRefreshing={isListLoading}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
        />

        {error ? (
          <p className="rounded-lg border border-auth-danger-border bg-auth-danger-bg px-4 py-3 text-sm text-auth-text">
            {error}
          </p>
        ) : null}

        <AdminNgoTable
          ngos={visibleNgos}
          isLoading={isListLoading}
          actionStateById={rowActionStateById}
          onView={handleOpenDetails}
          onEdit={handleOpenEditModal}
          onReview={handleOpenReviewModal}
          onVerify={handleQuickVerify}
          onDelete={handleAskDelete}
        />

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-auth-border bg-auth-surface px-4 py-3 shadow-sm">
          <p className="text-xs text-auth-text-soft">
            Showing {visibleNgos.length} profile(s). Page {currentPage} of {totalPages}. Total: {pagination.total || 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isListLoading}
              className="rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs font-semibold text-auth-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isListLoading}
              className="rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs font-semibold text-auth-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </footer>
      </div>

      <AdminNgoDetailDrawer
        isOpen={detailState.isOpen}
        ngo={detailState.ngo}
        isLoading={detailState.isLoading}
        onClose={handleCloseDetails}
      />

      <AdminNgoFormModal
        isOpen={formState.isOpen}
        mode={formState.mode}
        ngo={formState.ngo}
        isSubmitting={isFormSubmitting}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmitForm}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-[1650] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-auth-danger-bg p-2 text-danger">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-auth-text-strong">Delete NGO Profile</h3>
                <p className="mt-2 text-sm text-auth-text-soft">
                  This will delete the NGO profile. The linked user account will be downgraded to CITIZEN, and assigned help requests will be automatically re-evaluated by the backend.
                </p>
                <p className="mt-2 text-sm font-semibold text-auth-text">
                  Continue with deletion of {deleteTarget.organizationName || deleteTarget.registrationNumber || "this NGO"}?
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleteSubmitting}
                className="rounded-lg border border-auth-border bg-auth-bg px-4 py-2 text-sm font-semibold text-auth-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleteSubmitting}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {isDeleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isDeleteSubmitting ? "Deleting..." : "Delete Profile"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminToastRegion toasts={toasts} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}
