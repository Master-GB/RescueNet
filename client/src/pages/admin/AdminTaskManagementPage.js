import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAdminTasks from "../../hooks/useAdminTasks";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  ADMIN_TASK_FILTER_DEFAULTS,
} from "../../constants/adminTaskConstants";
import adminSidebarItems from "./adminSidebarItems";
import AdminTaskFilters from "../../components/admin/AdminTaskFilters";
import AdminTaskCard from "../../components/admin/AdminTaskCard";
import AdminAssignTaskModal from "../../components/admin/AdminAssignTaskModal";
import AdminTaskEditPanel from "../../components/admin/AdminTaskEditPanel";
import AdminToastRegion from "../../components/admin/AdminToastRegion";

const createToast = (type, title, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
});

const getSearchableText = (task) => {
  return [
    task?.name,
    task?.location,
    task?.contactNumber,
    task?.realLocation,
    task?.disasterType,
    task?.message,
    task?._id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export default function AdminTaskManagementPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(ADMIN_TASK_FILTER_DEFAULTS);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [toasts, setToasts] = useState([]);

  const {
    tasks,
    pagination,
    error,
    ngos,
    isListLoading,
    isNgosLoading,
    fetchTasks,
    prefetchNgos,
    assignTaskOptimistic,
    updateTaskFields,
  } = useAdminTasks();

  const addToast = useCallback((type, title, message) => {
    setToasts((prev) => [...prev, createToast(type, title, message)]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      await fetchTasks(filters);
    } catch (loadError) {
      addToast("error", "Load failed", loadError.message || "Could not load requests.");
    }
  }, [addToast, fetchTasks, filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    prefetchNgos().catch((ngoError) => {
      addToast("warning", "NGO prefetch failed", ngoError.message || "Could not prefetch NGOs.");
    });
  }, [addToast, prefetchNgos]);

  const visibleTasks = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    if (!search) {
      return tasks;
    }

    return tasks.filter((task) => getSearchableText(task).includes(search));
  }, [debouncedSearch, tasks]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters(ADMIN_TASK_FILTER_DEFAULTS);
    setSearchInput("");
  };

  const handleAssign = async (task, payload) => {
    await assignTaskOptimistic({
      taskId: task._id,
      organizationId: payload.organizationId,
      taskType: payload.taskType,
    });

    addToast(
      "success",
      "Task assigned",
      `${task.name || "Request"} was assigned successfully.`,
    );
  };

  const handleEditSave = async (task, payload) => {
    await updateTaskFields(task._id, {
      status: payload.status,
      adminNotes: payload.adminNotes,
      rejectionReason: payload.rejectionReason,
      publishedToSocial: payload.publishedToSocial,
    });

    if (payload.taskType !== (task.assignments?.[0]?.taskType || "General Relief")) {
      addToast(
        "info",
        "Task type note",
        "Task type is applied during assignment with current API contracts.",
      );
    }

    addToast("success", "Task updated", "Help request details were updated.");
  };

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  const gotoPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  return (
    <DashboardLayout
      sidebarItems={adminSidebarItems}
      portalTitle="Admin Portal"
      avatarLetter="A"
      homePath="/admin-dashboard"
      searchPlaceholder="Search requests, NGOs, responders..."
    >
      <section className="space-y-5">
        <header className="rounded-2xl bg-surface-container-low p-6 ghost-outline">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary px-3 py-2 text-on-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-on-surface">Task Management</h1>
              <p className="mt-2 text-sm text-on-surface/80">
                Review incoming help requests, assign NGOs, and keep the response lifecycle moving.
              </p>
            </div>
          </div>
        </header>

        <AdminTaskFilters
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={loadTasks}
          isRefreshing={isListLoading}
        />

        {error && (
          <p className="rounded-xl bg-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {isListLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl bg-surface-container-high"
              />
            ))}
          </div>
        ) : visibleTasks.length === 0 ? (
          <section className="rounded-2xl bg-surface-container-low p-10 ghost-outline text-center">
            <h2 className="text-xl font-semibold text-on-surface">No requests found</h2>
            <p className="mt-2 text-sm text-on-surface/75">
              Try changing filters or clearing the search query.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            >
              Clear filters
            </button>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleTasks.map((task) => (
                <AdminTaskCard
                  key={task._id}
                  task={task}
                  onAssign={setSelectedTaskForAssign}
                  onEdit={setSelectedTaskForEdit}
                  onView={(selectedTask) => navigate(`/admin/tasks/${selectedTask._id}`)}
                />
              ))}
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-4 py-3 ghost-outline">
              <p className="text-xs text-on-surface/70">
                Showing {visibleTasks.length} request(s). Page {currentPage} of {totalPages}.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => gotoPage(currentPage - 1)}
                  disabled={currentPage <= 1 || isListLoading}
                  className="rounded-lg bg-surface-variant px-3 py-2 text-xs font-semibold text-on-surface disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => gotoPage(currentPage + 1)}
                  disabled={currentPage >= totalPages || isListLoading}
                  className="rounded-lg bg-surface-variant px-3 py-2 text-xs font-semibold text-on-surface disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      <AdminAssignTaskModal
        isOpen={Boolean(selectedTaskForAssign)}
        task={selectedTaskForAssign}
        ngos={ngos}
        isNgosLoading={isNgosLoading}
        onClose={() => setSelectedTaskForAssign(null)}
        onAssign={handleAssign}
      />

      <AdminTaskEditPanel
        isOpen={Boolean(selectedTaskForEdit)}
        task={selectedTaskForEdit}
        onClose={() => setSelectedTaskForEdit(null)}
        onSave={handleEditSave}
      />

      <AdminToastRegion toasts={toasts} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}
