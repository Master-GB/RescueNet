export const ADMIN_TASK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export const ADMIN_URGENCY_OPTIONS = [
  { value: "", label: "All urgencies" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const ADMIN_DISASTER_TYPE_OPTIONS = [
  { value: "", label: "All disasters" },
  { value: "flood", label: "Flood" },
  { value: "tsunami", label: "Tsunami" },
  { value: "landslide", label: "Landslide" },
  { value: "cyclone", label: "Cyclone" },
  { value: "other", label: "Other" },
];

export const ADMIN_ASSIGNMENT_FILTER_OPTIONS = [
  { value: "", label: "All assignments" },
  { value: "unassigned", label: "Unassigned" },
];

export const ADMIN_TASK_FILTER_DEFAULTS = {
  status: "",
  disasterType: "",
  urgency: "",
  assignedTo: "",
  page: 1,
  limit: 12,
};

export const ADMIN_TASK_ENDPOINTS = {
  HELP_REQUESTS: "/api/admin/help-requests",
  HELP_REQUEST_BY_ID: (id) => `/api/admin/help-requests/${id}`,
  ASSIGN_HELP_REQUEST: (id) => `/api/admin/help-requests/${id}/assign`,
  NGOS: "/api/admin/ngos",
};

export const ADMIN_TASK_STATUS_TONE = {
  pending: "bg-warning/20 text-warning",
  verified: "bg-secondary/20 text-secondary",
  assigned: "bg-primary/20 text-primary",
  "in-progress": "bg-primary-container/20 text-primary",
  resolved: "bg-success/20 text-success",
  rejected: "bg-danger/20 text-danger",
};

export const ADMIN_DISASTER_TONE = {
  fire: {
    label: "Fire",
    className: "bg-danger/20 text-danger",
  },
  medical: {
    label: "Medical",
    className: "bg-danger/20 text-danger",
  },
  flood: {
    label: "Flood",
    className: "bg-warning/20 text-warning",
  },
  tsunami: {
    label: "Tsunami",
    className: "bg-danger/20 text-danger",
  },
  landslide: {
    label: "Landslide",
    className: "bg-danger/20 text-danger",
  },
  cyclone: {
    label: "Cyclone",
    className: "bg-warning/20 text-warning",
  },
  other: {
    label: "Other",
    className: "bg-surface-variant text-on-surface",
  },
};
