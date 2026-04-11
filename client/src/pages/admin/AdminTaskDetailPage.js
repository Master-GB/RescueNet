import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckSquare, FilePenLine, MapPin, Phone, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAdminTasks from "../../hooks/useAdminTasks";
import adminSidebarItems from "./adminSidebarItems";
import AdminAssignTaskModal from "../../components/admin/AdminAssignTaskModal";
import AdminTaskEditPanel from "../../components/admin/AdminTaskEditPanel";
import AdminToastRegion from "../../components/admin/AdminToastRegion";
import { ADMIN_TASK_STATUS_TONE } from "../../constants/adminTaskConstants";

const createToast = (type, title, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
});

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function AdminTaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  const {
    selectedTask,
    ngos,
    error,
    isTaskLoading,
    isNgosLoading,
    fetchTaskById,
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

  const loadTask = useCallback(async () => {
    if (!taskId) {
      return;
    }

    try {
      await fetchTaskById(taskId);
    } catch (loadError) {
      addToast("error", "Load failed", loadError.message || "Could not load task details.");
    }
  }, [addToast, fetchTaskById, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  useEffect(() => {
    prefetchNgos().catch((ngoError) => {
      addToast("warning", "NGO prefetch failed", ngoError.message || "Could not prefetch NGOs.");
    });
  }, [addToast, prefetchNgos]);

  const handleAssign = async (task, payload) => {
    await assignTaskOptimistic({
      taskId: task._id,
      organizationId: payload.organizationId,
      taskType: payload.taskType,
    });
    await loadTask();

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

    await loadTask();

    if (payload.taskType !== (task.assignments?.[0]?.taskType || "General Relief")) {
      addToast(
        "info",
        "Task type note",
        "Task type is applied during assignment with current API contracts.",
      );
    }

    addToast("success", "Task updated", "Help request details were updated.");
  };

  const statusClass = ADMIN_TASK_STATUS_TONE[selectedTask?.status] || "bg-surface-variant text-on-surface";

  return (
    <DashboardLayout
      sidebarItems={adminSidebarItems}
      portalTitle="Admin Portal"
      avatarLetter="A"
      homePath="/admin-dashboard"
      searchPlaceholder="Search requests, NGOs, responders..."
    >
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/tasks")}
          className="inline-flex items-center gap-2 rounded-xl bg-surface-variant px-3 py-2 text-sm text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Task Management
        </button>

        {error && (
          <p className="rounded-xl bg-danger/20 px-4 py-3 text-sm text-danger">{error}</p>
        )}

        {isTaskLoading || !selectedTask ? (
          <div className="h-64 animate-pulse rounded-2xl bg-surface-container-high" />
        ) : (
          <>
            <header className="rounded-2xl bg-surface-container-low p-6 ghost-outline">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-on-surface">{selectedTask.name || "Unknown requester"}</h1>
                  <p className="mt-2 text-sm text-on-surface/80">Request ID: {selectedTask._id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                  {(selectedTask.status || "unknown").toUpperCase()}
                </span>
              </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl bg-surface-container-high p-5 ghost-outline lg:col-span-2">
                <h2 className="text-lg font-semibold text-on-surface">Full Request Details</h2>
                <div className="mt-4 space-y-3 text-sm text-on-surface/85">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedTask.location || "No location"}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedTask.contactNumber || "No contact"}</p>
                  <p className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Disaster Type: {selectedTask.disasterType || "-"}</p>
                  <p>Urgency: {(selectedTask.urgency || "-").toUpperCase()}</p>
                  <p>Published To Social: {selectedTask.publishedToSocial ? "Yes" : "No"}</p>
                  <p>Created At: {formatDate(selectedTask.createdAt)}</p>
                  <p>Updated At: {formatDate(selectedTask.updatedAt)}</p>
                  <p>Resolved At: {formatDate(selectedTask.resolvedAt)}</p>
                </div>

                <div className="mt-4 rounded-xl bg-surface-container-low p-4">
                  <h3 className="text-sm font-semibold text-on-surface">Message</h3>
                  <p className="mt-2 text-sm text-on-surface/80 whitespace-pre-wrap">
                    {selectedTask.message || "No message provided"}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-surface-container-low p-4">
                  <h3 className="text-sm font-semibold text-on-surface">Admin Notes</h3>
                  <p className="mt-2 text-sm text-on-surface/80 whitespace-pre-wrap">
                    {selectedTask.adminNotes || "No admin notes"}
                  </p>
                  {selectedTask.rejectionReason && (
                    <p className="mt-3 rounded-lg bg-danger/20 px-3 py-2 text-xs text-danger">
                      Rejection Reason: {selectedTask.rejectionReason}
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl bg-surface-container-high p-5 ghost-outline">
                <h2 className="text-lg font-semibold text-on-surface">Assignments</h2>
                {!selectedTask.assignments?.length ? (
                  <p className="mt-3 text-sm text-on-surface/75">No NGOs assigned yet.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {selectedTask.assignments.map((assignment) => {
                      const ngo = assignment.ngoId || {};
                      return (
                        <li
                          key={`${ngo._id || ngo}-${assignment.assignedAt}`}
                          className="rounded-xl bg-surface-container-low p-3"
                        >
                          <p className="text-sm font-semibold text-on-surface">
                            {ngo.organizationName || ngo.userId?.name || ngo.contactPerson || ngo.registrationNumber || "Unknown NGO"}
                          </p>
                          <p className="mt-1 text-xs text-on-surface/70">
                            Type: {assignment.taskType || "General Relief"}
                          </p>
                          <p className="text-xs text-on-surface/70">
                            Status: {(assignment.status || "assigned").toUpperCase()}
                          </p>
                          <p className="text-xs text-on-surface/60">
                            Assigned: {formatDate(assignment.assignedAt)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            </section>

            <footer className="rounded-2xl bg-surface-container-low p-4 ghost-outline">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForAssign(selectedTask)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-semibold text-primary"
                >
                  <CheckSquare className="h-4 w-4" />
                  Assign Task
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTaskForEdit(selectedTask)}
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-variant px-4 py-2 text-sm font-semibold text-on-surface"
                >
                  <FilePenLine className="h-4 w-4" />
                  Edit Details
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
