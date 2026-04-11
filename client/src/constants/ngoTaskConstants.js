export const NGO_TASK_ENDPOINTS = {
  HELP_REQUESTS: "/api/ngo/help-requests",
  PERFORMANCE: "/api/ngo/help-requests/performance",
  HELP_REQUEST_BY_ID: (requestId) => `/api/ngo/help-requests/${requestId}`,
  ACCEPT_TASK: (requestId) => `/api/ngo/help-requests/${requestId}/accept`,
  DECLINE_TASK: (requestId) => `/api/ngo/help-requests/${requestId}/decline`,
  MARK_IN_PROGRESS: (requestId) => `/api/ngo/help-requests/${requestId}/in-progress`,
  MARK_COMPLETE: (requestId) => `/api/ngo/help-requests/${requestId}/complete`,
};

export const NGO_TASK_FILTER_DEFAULTS = {
  status: "",
  priority: "",
  page: 1,
  limit: 12,
};

export const NGO_TASK_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "assigned", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
];

export const NGO_TASK_PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const NGO_TASK_STATUS_LABELS = {
  assigned: "Pending",
  accepted: "Accepted",
  "in-progress": "Active",
  completed: "Completed",
  declined: "Declined",
};

export const NGO_TASK_STATUS_TONE = {
  assigned: "border-secondary/40 bg-secondary/20 text-auth-text",
  accepted: "border-primary/40 bg-primary/20 text-auth-text",
  "in-progress": "border-warning/40 bg-warning/20 text-auth-text",
  completed: "border-success/40 bg-success/20 text-auth-text",
  declined: "border-danger/40 bg-danger/20 text-auth-text",
};

export const NGO_TASK_PRIORITY_TONE = {
  high: {
    label: "High",
    cardBorder: "border-danger/40",
    topAccent: "bg-danger",
    badge: "border-danger/40 bg-danger/15 text-danger",
  },
  medium: {
    label: "Medium",
    cardBorder: "border-warning/40",
    topAccent: "bg-warning",
    badge: "border-warning/40 bg-warning/15 text-yellow-700",
  },
  low: {
    label: "Low",
    cardBorder: "border-success/40",
    topAccent: "bg-success",
    badge: "border-success/40 bg-success/15 text-green-700",
  },
};

const getAssignmentNgoId = (assignment) => {
  if (!assignment?.ngoId) {
    return "";
  }

  if (typeof assignment.ngoId === "string") {
    return assignment.ngoId;
  }

  return assignment.ngoId?._id || "";
};

export const resolveNgoAssignment = (task, ngoProfileId) => {
  if (!Array.isArray(task?.assignments) || task.assignments.length === 0) {
    return null;
  }

  if (!ngoProfileId) {
    return task.assignments[0] || null;
  }

  const ownAssignment = task.assignments.find(
    (assignment) => String(getAssignmentNgoId(assignment)) === String(ngoProfileId),
  );

  return ownAssignment || task.assignments[0] || null;
};

export const resolveAssignmentStatus = (task, ngoProfileId) => {
  const assignment = resolveNgoAssignment(task, ngoProfileId);
  return assignment?.status || "assigned";
};
