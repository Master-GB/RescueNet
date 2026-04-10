import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, ClipboardList, Clock3, ShieldAlert } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import NGOnavbar from "../../components/ngoDashboard/NGOnavbar";
import NGOTaskCard from "../../components/ngoDashboard/NGOTaskCard";
import NGOTaskDetailModal from "../../components/ngoDashboard/NGOTaskDetailModal";
import NGOTaskFilters from "../../components/ngoDashboard/NGOTaskFilters";
import NGOTaskToastRegion from "../../components/ngoDashboard/NGOTaskToastRegion";
import ngoSidebarItems from "./ngoSidebarItems";
import {
  NGO_TASK_FILTER_DEFAULTS,
  resolveAssignmentStatus,
} from "../../constants/ngoTaskConstants";
import useNgoTasks from "../../hooks/useNgoTasks";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getNgoProfile, updateNgoStatus } from "../../services/profileService";

const createToast = (type, title, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
});

const extractApiMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || fallbackMessage
  );
};

const getSearchableText = (task) => {
  return [
    task?.name,
    task?.location,
    task?.realLocation,
    task?.contactNumber,
    task?.disasterType,
    task?.message,
    task?._id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const normalizeNgoProfile = (response) => {
  if (!response) {
    return null;
  }

  if (response.profileData) {
    return response.profileData;
  }

  if (response.data?.profileData) {
    return response.data.profileData;
  }

  if (response.data && typeof response.data === "object") {
    return response.data;
  }

  if (typeof response === "object") {
    return response;
  }

  return null;
};

const summaryCardConfig = [
  {
    key: "assigned",
    title: "Pending",
    icon: Clock3,
    tone: "border-secondary/30 bg-secondary/10",
  },
  {
    key: "inProgress",
    title: "Active",
    icon: Activity,
    tone: "border-warning/30 bg-warning/10",
  },
  {
    key: "completed",
    title: "Completed",
    icon: CheckCircle2,
    tone: "border-success/30 bg-success/10",
  },
  {
    key: "declined",
    title: "Declined",
    icon: ShieldAlert,
    tone: "border-danger/30 bg-danger/10",
  },
];

export default function NgoTaskManagementPage() {
  const [filters, setFilters] = useState(NGO_TASK_FILTER_DEFAULTS);
  const [searchInput, setSearchInput] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [toasts, setToasts] = useState([]);
  const [profileError, setProfileError] = useState("");
  const [ngoProfileId, setNgoProfileId] = useState("");
  const [ngoData, setNgoData] = useState({
    registrationNumber: "",
    availabilityStatus: "OFFLINE",
    approvalStatus: "approved",
  });

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const {
    tasks,
    pagination,
    performance,
    selectedTask,
    error,
    detailError,
    actionError,
    isLoading,
    isDetailLoading,
    isPerformanceLoading,
    fetchTasks,
    fetchPerformance,
    fetchTaskById,
    setSelectedTask,
    acceptTask,
    declineTask,
    markTaskInProgress,
    markTaskCompleted,
    isTaskUpdating,
  } = useNgoTasks({ ngoProfileId });

  const addToast = useCallback((type, title, message) => {
    setToasts((prev) => [...prev, createToast(type, title, message)]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const loadNgoProfile = useCallback(async () => {
    setProfileError("");

    try {
      const response = await getNgoProfile();
      const profile = normalizeNgoProfile(response);

      if (!profile) {
        setProfileError("Could not load NGO profile details.");
        return;
      }

      setNgoData((prev) => ({ ...prev, ...profile }));
      setNgoProfileId(profile._id || "");
    } catch (profileLoadError) {
      const message = extractApiMessage(profileLoadError, "Could not load NGO profile details.");
      setProfileError(message);
      addToast("warning", "Profile issue", message);
    }
  }, [addToast]);

  const loadTasks = useCallback(async () => {
    try {
      await fetchTasks({
        status: filters.status,
        page: filters.page,
        limit: filters.limit,
      });
    } catch (taskLoadError) {
      addToast("error", "Load failed", taskLoadError.message || "Could not load assigned tasks.");
    }
  }, [addToast, fetchTasks, filters.limit, filters.page, filters.status]);

  const loadPerformance = useCallback(async () => {
    try {
      await fetchPerformance();
    } catch (performanceError) {
      addToast("warning", "Stats unavailable", performanceError.message || "Could not load task performance.");
    }
  }, [addToast, fetchPerformance]);

  useEffect(() => {
    loadNgoProfile();
  }, [loadNgoProfile]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  const filteredTasks = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();

    return tasks.filter((task) => {
      const priorityMatch = !filters.priority
        || String(task?.urgency || "").toLowerCase() === filters.priority;

      const searchMatch = !search || getSearchableText(task).includes(search);

      return priorityMatch && searchMatch;
    });
  }, [debouncedSearch, filters.priority, tasks]);

  const selectedTaskFromList = useMemo(() => {
    if (!selectedTaskId) {
      return null;
    }

    if (selectedTask?._id === selectedTaskId) {
      return selectedTask;
    }

    return tasks.find((task) => task._id === selectedTaskId) || null;
  }, [selectedTask, selectedTaskId, tasks]);

  const selectedAssignmentStatus = resolveAssignmentStatus(selectedTaskFromList, ngoProfileId);

  const handleStatusToggle = async () => {
    const previousStatus = ngoData.availabilityStatus || "OFFLINE";
    const nextStatus = previousStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";

    setNgoData((prev) => ({
      ...prev,
      availabilityStatus: nextStatus,
    }));

    try {
      await updateNgoStatus({ availabilityStatus: nextStatus });
      addToast("success", "Availability updated", `NGO status changed to ${nextStatus}.`);
    } catch (statusError) {
      setNgoData((prev) => ({
        ...prev,
        availabilityStatus: previousStatus,
      }));

      const message = extractApiMessage(statusError, "Could not update availability status.");
      addToast("error", "Status update failed", message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters(NGO_TASK_FILTER_DEFAULTS);
    setSearchInput("");
  };

  const handleOpenTask = async (task) => {
    setSelectedTaskId(task._id);

    try {
      await fetchTaskById(task._id);
    } catch (taskError) {
      addToast("error", "Task details failed", taskError.message || "Could not load full task details.");
    }
  };

  const handleCloseTaskModal = () => {
    setSelectedTaskId("");
    setSelectedTask(null);
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const response = await acceptTask(taskId);
      await loadPerformance();
      addToast("success", "Task accepted", response?.message || "Task accepted successfully.");
    } catch (acceptError) {
      const message = acceptError.message || "Could not accept task.";
      addToast("error", "Accept failed", message);
      throw acceptError;
    }
  };

  const handleDeclineTask = async (taskId, reason) => {
    try {
      const response = await declineTask(taskId, reason);
      await loadPerformance();
      addToast("success", "Task declined", response?.message || "Task declined successfully.");
    } catch (declineError) {
      const message = declineError.message || "Could not decline task.";
      addToast("error", "Decline failed", message);
      throw declineError;
    }
  };

  const handleMarkInProgress = async (taskId) => {
    try {
      const response = await markTaskInProgress(taskId);
      await loadPerformance();
      addToast("success", "Task activated", response?.message || "Task moved to active status.");
    } catch (progressError) {
      const message = progressError.message || "Could not mark task in progress.";
      addToast("error", "Status update failed", message);
      throw progressError;
    }
  };

  const handleMarkCompleted = async (taskId) => {
    try {
      const response = await markTaskCompleted(taskId);
      await loadPerformance();
      addToast("success", "Task resolved", response?.message || "Task marked as resolved.");
    } catch (completeError) {
      const message = completeError.message || "Could not complete task.";
      addToast("error", "Completion failed", message);
      throw completeError;
    }
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
      sidebarItems={ngoSidebarItems}
      portalTitle="NGO Portal"
      avatarLetter="N"
      homePath="/ngo-dashboard"
      searchPlaceholder="Search tasks, campaigns, and donations..."
      contentClassName="bg-auth-bg"
    >
      <section className="space-y-5 rounded-2xl bg-auth-bg text-auth-text">
        <NGOnavbar ngoData={ngoData} handleStatusToggle={handleStatusToggle} />

        <main className="mx-auto w-full max-w-7xl px-1 py-1 sm:px-2 lg:px-2">
          <header className="rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-auth-text-soft">NGO Response Desk</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-auth-text">Task Management</h1>
                <p className="mt-2 text-sm text-auth-text-soft">
                  Review assigned help requests, update task status, and keep response work progressing.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-auth-border bg-auth-bg px-3 py-2 text-sm text-auth-text-soft">
                <ClipboardList className="h-4 w-4" />
                {pagination?.total || 0} total assignments
              </div>
            </div>
          </header>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCardConfig.map((card) => {
              const Icon = card.icon;
              const value = performance?.assignmentCounts?.[card.key] || 0;

              return (
                <article
                  key={card.key}
                  className={`rounded-2xl border bg-auth-surface p-4 shadow-sm ${card.tone}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">{card.title}</p>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-auth-text">
                    {isPerformanceLoading ? "..." : value}
                  </p>
                </article>
              );
            })}
          </section>

          {profileError ? (
            <p className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-auth-text">
              {profileError}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {actionError ? (
            <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {actionError}
            </p>
          ) : null}

          <div className="mt-5">
            <NGOTaskFilters
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onRefresh={loadTasks}
              isRefreshing={isLoading}
            />
          </div>

          <section className="mt-5">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-56 animate-pulse rounded-2xl border border-auth-border bg-auth-surface"
                  />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <section className="rounded-2xl border border-auth-border bg-auth-surface p-10 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-auth-text">No tasks found</h2>
                <p className="mt-2 text-sm text-auth-text-soft">
                  Try changing your filters or clearing the search input.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
                >
                  Clear filters
                </button>
              </section>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTasks.map((task) => (
                  <NGOTaskCard
                    key={task._id}
                    task={task}
                    assignmentStatus={resolveAssignmentStatus(task, ngoProfileId)}
                    onOpenDetails={handleOpenTask}
                    isUpdating={isTaskUpdating(task._id)}
                  />
                ))}
              </div>
            )}
          </section>

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-auth-border bg-auth-surface px-4 py-3 shadow-sm">
            <p className="text-xs text-auth-text-soft">
              Showing {filteredTasks.length} task(s). Page {currentPage} of {totalPages}.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => gotoPage(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs font-semibold text-auth-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => gotoPage(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs font-semibold text-auth-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </footer>
        </main>

        <NGOTaskDetailModal
          isOpen={Boolean(selectedTaskId)}
          task={selectedTaskFromList}
          assignmentStatus={selectedAssignmentStatus}
          isLoading={isDetailLoading}
          isUpdating={isTaskUpdating(selectedTaskId)}
          detailError={detailError}
          actionError={actionError}
          onClose={handleCloseTaskModal}
          onAccept={handleAcceptTask}
          onDecline={handleDeclineTask}
          onMarkInProgress={handleMarkInProgress}
          onMarkCompleted={handleMarkCompleted}
        />

        <NGOTaskToastRegion toasts={toasts} onDismiss={dismissToast} />
      </section>
    </DashboardLayout>
  );
}
