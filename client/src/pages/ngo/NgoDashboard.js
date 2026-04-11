import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Heart,
  MapPin,
  Megaphone,
  RefreshCw,
  ShieldAlert,
  User,
  Users,
  Zap,
  LayoutDashboard,
  UserCircle
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import NGOnavbar from "../../components/ngoDashboard/NGOnavbar";
import NGOTaskToastRegion from "../../components/ngoDashboard/NGOTaskToastRegion";
import {
  resolveAssignmentStatus,
  resolveNgoAssignment,
} from "../../constants/ngoTaskConstants";
import { getApiErrorMessage } from "../../services/authService";
import { updateNgoStatus } from "../../services/profileService";
import { fetchNgoDashboardRawData } from "../../services/ngoDashboardService";
import ngoSidebarItems from "./ngoSidebarItems";

// Replaced ngoSidebarItems array since it's now handled in AppRoutes.js
const STATUS_COLORS = {
  assigned: "#f59e0b",
  accepted: "#2cda9d",
  "in-progress": "#005f5f",
  completed: "#16a34a",
  declined: "#ef4444",
};

const URGENCY_RANK = {
  high: 3,
  medium: 2,
  low: 1,
};

const createToast = (type, title, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
});

const toSafeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLkr = (value = 0) => {
  const number = Number(value) || 0;
  return number.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  const date = toSafeDate(value);
  if (!date) {
    return "-";
  }

  return date.toLocaleString("en-LK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUrgencyPill = (urgency) => {
  const normalizedUrgency = String(urgency || "").toLowerCase();
  if (normalizedUrgency === "high") {
    return "bg-danger/15 text-danger";
  }

  if (normalizedUrgency === "medium") {
    return "bg-warning/15 text-yellow-800";
  }

  return "bg-success/15 text-green-700";
};

const NgoMetricCard = memo(function NgoMetricCard({
  label,
  value,
  icon: Icon,
  hint,
  isLoading,
}) {
  return (
    <article className="rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">{label}</p>
        <span className="rounded-lg border border-auth-border bg-auth-bg p-2 text-auth-text-soft">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold text-auth-text-strong">
        {isLoading ? "..." : value}
      </p>
      <p className="mt-2 text-xs text-auth-text-soft">{hint}</p>
    </article>
  );
});

const NgoDashboard = () => {
  const navigate = useNavigate();

  const [ngoData, setNgoData] = useState({
    registrationNumber: "",
    availabilityStatus: "OFFLINE",
    approvalStatus: "approved",
  });
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const addToast = useCallback((type, title, message) => {
    setToasts((prev) => [...prev, createToast(type, title, message)]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const loadDashboardData = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setServerError("");

    try {
      const response = await fetchNgoDashboardRawData();

      if (response.profile) {
        setNgoData((prev) => ({
          ...prev,
          ...response.profile,
        }));
      }

      setTasks(Array.isArray(response.tasks) ? response.tasks : []);
      setCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
      setDonations(Array.isArray(response.donations) ? response.donations : []);
      setPerformance(response.performance || null);
      setLastUpdated(new Date());

      if (response.donationErrors?.length) {
        addToast(
          "warning",
          "Partial donation data",
          `${response.donationErrors.length} campaign(s) could not be fully loaded.`,
        );
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load NGO dashboard data.");
      setServerError(message);
      addToast("error", "Dashboard load failed", message);
      throw error;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadDashboardData().catch(() => {});
  }, [loadDashboardData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData({ showLoading: false });
      addToast("success", "Dashboard refreshed", "Latest NGO metrics are now visible.");
    } catch {
      // Error toast and inline state are handled in loadDashboardData.
    } finally {
      setIsRefreshing(false);
    }
  }, [addToast, loadDashboardData]);

  const handleStatusToggle = useCallback(async () => {
    const previousStatus = ngoData.availabilityStatus || "OFFLINE";
    const nextStatus = previousStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";

    setNgoData((prev) => ({
      ...prev,
      availabilityStatus: nextStatus,
    }));

    try {
      await updateNgoStatus({ availabilityStatus: nextStatus });
      addToast("success", "Availability updated", `NGO status changed to ${nextStatus}.`);
    } catch (error) {
      setNgoData((prev) => ({
        ...prev,
        availabilityStatus: previousStatus,
      }));

      const message = getApiErrorMessage(error, "Could not update availability status.");
      setServerError(message);
      addToast("error", "Status update failed", message);
    }
  }, [addToast, ngoData.availabilityStatus]);

  const ngoProfileId = ngoData?._id || "";

  const assignmentCountsFromTasks = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const status = resolveAssignmentStatus(task, ngoProfileId);

        if (status === "accepted") {
          acc.accepted += 1;
        } else if (status === "in-progress") {
          acc.inProgress += 1;
        } else if (status === "completed") {
          acc.completed += 1;
        } else if (status === "declined") {
          acc.declined += 1;
        } else {
          acc.assigned += 1;
        }

        return acc;
      },
      {
        assigned: 0,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        declined: 0,
      },
    );
  }, [ngoProfileId, tasks]);

  const assignmentCounts = useMemo(() => {
    const performanceCounts = performance?.assignmentCounts || {};

    return {
      assigned: Number(performanceCounts.assigned ?? assignmentCountsFromTasks.assigned),
      accepted: Number(performanceCounts.accepted ?? assignmentCountsFromTasks.accepted),
      inProgress: Number(performanceCounts.inProgress ?? assignmentCountsFromTasks.inProgress),
      completed: Number(performanceCounts.completed ?? assignmentCountsFromTasks.completed),
      declined: Number(performanceCounts.declined ?? assignmentCountsFromTasks.declined),
    };
  }, [assignmentCountsFromTasks, performance?.assignmentCounts]);

  const metrics = useMemo(() => {
    const pendingDonations = donations.reduce((sum, donation) => {
      if (donation?.status !== "Pending") {
        return sum;
      }

      return sum + (Number(donation?.declaredAmount) || 0);
    }, 0);

    return {
      activeTasks: assignmentCounts.accepted + assignmentCounts.inProgress,
      pendingDonationAmount: pendingDonations,
      activeCampaigns: campaigns.filter((campaign) => campaign?.status === "Active").length,
      peopleAssisted: Number(performance?.completedTasks ?? assignmentCounts.completed),
    };
  }, [assignmentCounts, campaigns, donations, performance?.completedTasks]);

  const metricCards = useMemo(() => {
    return [
      {
        key: "active-tasks",
        label: "Active Tasks",
        value: metrics.activeTasks,
        icon: ClipboardList,
        hint: `${assignmentCounts.assigned} pending assignment(s)`,
      },
      {
        key: "pending-donations",
        label: "Pending Donations",
        value: `LKR ${toLkr(metrics.pendingDonationAmount)}`,
        icon: Heart,
        hint: `${donations.filter((donation) => donation?.status === "Pending").length} pending donation(s)`,
      },
      {
        key: "active-campaigns",
        label: "Active Campaigns",
        value: metrics.activeCampaigns,
        icon: Megaphone,
        hint: `${campaigns.length} campaign(s) total`,
      },
      {
        key: "people-assisted",
        label: "People Assisted",
        value: metrics.peopleAssisted.toLocaleString("en-LK"),
        icon: Users,
        hint: "Completed support assignments",
      },
    ];
  }, [assignmentCounts.assigned, campaigns.length, donations, metrics.activeCampaigns, metrics.activeTasks, metrics.pendingDonationAmount, metrics.peopleAssisted]);

  const donationTrendData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayFrames = Array.from({ length: 7 }, (_, index) => {
      const frameDate = new Date(today);
      frameDate.setDate(today.getDate() - (6 - index));
      return {
        key: toDateKey(frameDate),
        label: frameDate.toLocaleDateString("en-LK", {
          weekday: "short",
        }),
      };
    });

    const totals = dayFrames.reduce((acc, frame) => {
      acc[frame.key] = {
        total: 0,
        verified: 0,
      };
      return acc;
    }, {});

    donations.forEach((donation) => {
      const createdAt = toSafeDate(donation?.createdAt);
      if (!createdAt) {
        return;
      }

      const key = toDateKey(createdAt);
      if (!totals[key]) {
        return;
      }

      const declaredAmount = Number(donation?.declaredAmount) || 0;
      totals[key].total += declaredAmount;

      if (donation?.status === "Verified") {
        totals[key].verified += declaredAmount;
      }
    });

    return dayFrames.map((frame) => ({
      name: frame.label,
      total: totals[frame.key].total,
      verified: totals[frame.key].verified,
    }));
  }, [donations]);

  const taskStatusData = useMemo(() => {
    const data = [
      { name: "Pending", value: assignmentCounts.assigned, color: STATUS_COLORS.assigned },
      { name: "Accepted", value: assignmentCounts.accepted, color: STATUS_COLORS.accepted },
      { name: "In Progress", value: assignmentCounts.inProgress, color: STATUS_COLORS["in-progress"] },
      { name: "Completed", value: assignmentCounts.completed, color: STATUS_COLORS.completed },
      { name: "Declined", value: assignmentCounts.declined, color: STATUS_COLORS.declined },
    ];

    return data.filter((item) => item.value > 0);
  }, [assignmentCounts]);

  const urgentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const urgencyDelta = (URGENCY_RANK[b?.urgency] || 0) - (URGENCY_RANK[a?.urgency] || 0);
        if (urgencyDelta !== 0) {
          return urgencyDelta;
        }

        const aDate = toSafeDate(a?.createdAt);
        const bDate = toSafeDate(b?.createdAt);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 5)
      .map((task) => {
        const assignment = resolveNgoAssignment(task, ngoProfileId);

        return {
          id: task._id,
          location: task?.location || task?.realLocation || "Unknown location",
          missionType: assignment?.taskType || task?.disasterType || "General Relief",
          category: task?.message || "No summary available",
          urgency: task?.urgency || "low",
        };
      });
  }, [ngoProfileId, tasks]);

  const campaignFeed = useMemo(() => {
    const donationEvents = donations.map((donation) => ({
      id: `donation-${donation._id}`,
      type: donation?.status === "Verified" ? "verified" : "donation",
      title: donation?.donorId?.name || "Anonymous donor",
      action:
        donation?.status === "Verified"
          ? `verified LKR ${toLkr(donation?.declaredAmount)}`
          : `submitted LKR ${toLkr(donation?.declaredAmount)}`,
      context: donation?.campaignTitle || "Campaign",
      createdAt: donation?.createdAt,
    }));

    const campaignEvents = campaigns.map((campaign) => ({
      id: `campaign-${campaign._id}`,
      type: campaign?.status === "Completed" ? "target" : "campaign",
      title: campaign?.title || "Campaign",
      action:
        campaign?.status === "Completed"
          ? "marked as completed"
          : `status is ${campaign?.status || "Active"}`,
      context: `Raised LKR ${toLkr(campaign?.raisedAmount)}`,
      createdAt: campaign?.updatedAt || campaign?.createdAt,
    }));

    return [...donationEvents, ...campaignEvents]
      .sort((a, b) => {
        const aDate = toSafeDate(a.createdAt);
        const bDate = toSafeDate(b.createdAt);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 8);
  }, [campaigns, donations]);

  const totalTrackedTasks = useMemo(() => {
    return (
      assignmentCounts.assigned
      + assignmentCounts.accepted
      + assignmentCounts.inProgress
      + assignmentCounts.completed
      + assignmentCounts.declined
    );
  }, [assignmentCounts]);

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) {
      return "Not synced yet";
    }

    return lastUpdated.toLocaleString("en-LK");
  }, [lastUpdated]);
>>>>>>> remotes/origin/feat/upload-profile-photo

  return (
    <DashboardLayout
      sidebarItems={ngoSidebarItems}
      portalTitle="NGO Portal"
      avatarLetter="N"
      homePath="/ngo-dashboard"
      searchPlaceholder="Search tasks, campaigns, and donations..."
      themeColor="teal"
      contentClassName="bg-auth-bg"
    >
      <section className="space-y-5 rounded-2xl bg-auth-bg text-auth-text">
        <NGOnavbar ngoData={ngoData} handleStatusToggle={handleStatusToggle} />

        <header className="rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-auth-text-soft">NGO Operations Center</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-auth-text-strong">Dashboard Overview</h1>
              <p className="mt-2 text-sm text-auth-text-soft">
                Live NGO metrics built from raw help requests, campaigns, donations, and profile performance data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs text-auth-text-soft">
                Last updated: {lastUpdatedText}
              </div>
              <button
                type="button"
                onClick={() => navigate("/ngo/tasks")}
                className="inline-flex items-center gap-2 rounded-lg border border-auth-border bg-auth-bg px-4 py-2 text-sm font-semibold text-auth-text transition hover:bg-auth-border-subtle"
              >
                <Zap className="h-4 w-4" />
                Quick Dispatch
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading || isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {serverError ? (
            <p className="mt-4 rounded-lg border border-auth-danger-border bg-auth-danger-bg px-4 py-3 text-sm text-auth-text">
              {serverError}
            </p>
          ) : null}
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <NgoMetricCard
              key={metric.key}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              hint={metric.hint}
              isLoading={isLoading}
            />
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-auth-text-strong">Donations Received (Last 7 Days)</h2>
                <p className="text-xs text-auth-text-soft">Total vs verified donation amounts based on submission date.</p>
              </div>
            </div>

            <div className="h-72 w-full">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl border border-auth-border bg-auth-bg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d7dde5" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#58667a", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#58667a", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => `LKR ${toLkr(value)}`}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #d7dde5" }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#005f5f" strokeWidth={3} dot={false} name="Total" />
                    <Line type="monotone" dataKey="verified" stroke="#2cda9d" strokeWidth={2} dot={false} name="Verified" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-auth-border bg-auth-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-auth-text-strong">Task Status Mix</h2>
            <p className="mt-1 text-xs text-auth-text-soft">Current assignment distribution for this NGO profile.</p>

            <div className="relative mt-4 h-52 w-full">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl border border-auth-border bg-auth-bg" />
              ) : taskStatusData.length ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        dataKey="value"
                        innerRadius={56}
                        outerRadius={80}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {taskStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-extrabold text-auth-text-strong">{totalTrackedTasks}</p>
                    <p className="text-[10px] uppercase tracking-[0.08em] text-auth-text-soft">Tracked Tasks</p>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-auth-border bg-auth-bg">
                  <p className="text-sm text-auth-text-soft">No assignment data yet.</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-auth-text-soft">{item.name}</span>
                  </div>
                  <span className="font-semibold text-auth-text-strong">{item.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <article className="overflow-hidden rounded-2xl border border-auth-border bg-auth-surface shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-auth-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-auth-text-strong">Urgent Pending Tasks</h2>
                <p className="text-xs text-auth-text-soft">Sorted by urgency and recency from assigned request data.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/ngo/tasks")}
                className="rounded-lg bg-auth-bg px-3 py-2 text-xs font-semibold text-auth-text transition hover:bg-auth-border-subtle"
              >
                View all tasks
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2 p-5">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-14 animate-pulse rounded-xl border border-auth-border bg-auth-bg" />
                ))}
              </div>
            ) : urgentTasks.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="bg-auth-bg text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-auth-text-soft">
                      <th className="px-5 py-3">Location</th>
                      <th className="px-5 py-3">Mission Type</th>
                      <th className="px-5 py-3">Summary</th>
                      <th className="px-5 py-3 text-center">Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentTasks.map((task) => (
                      <tr key={task.id} className="border-t border-auth-border">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg border border-auth-border bg-auth-bg p-1.5 text-auth-text-soft">
                              <MapPin className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-sm font-semibold text-auth-text-strong">{task.location}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-auth-text">{task.missionType}</td>
                        <td className="px-5 py-3 text-sm text-auth-text-soft">
                          <p className="line-clamp-2 max-w-[320px]">{task.category}</p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${getUrgencyPill(task.urgency)}`}>
                            {task.urgency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-auth-text-soft">No pending urgent tasks at the moment.</p>
              </div>
            )}
          </article>

          <article className="flex h-full flex-col rounded-2xl border border-auth-border bg-auth-surface shadow-sm">
            <div className="border-b border-auth-border px-5 py-4">
              <h2 className="text-lg font-semibold text-auth-text-strong">Campaign Feed</h2>
              <p className="text-xs text-auth-text-soft">Latest donation and campaign status activity.</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {isLoading ? (
                [1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-14 animate-pulse rounded-xl border border-auth-border bg-auth-bg" />
                ))
              ) : campaignFeed.length ? (
                campaignFeed.map((feed) => (
                  <article key={feed.id} className="flex gap-3">
                    <span className="mt-0.5 rounded-full border border-auth-border bg-auth-bg p-2 text-auth-text-soft">
                      {feed.type === "target" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : feed.type === "verified" ? (
                        <ShieldAlert className="h-4 w-4 text-warning" />
                      ) : feed.type === "campaign" ? (
                        <Megaphone className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm text-auth-text-strong">
                        <span className="font-semibold">{feed.title}</span> {feed.action}
                      </p>
                      <p className="text-xs text-auth-text-soft">{feed.context}</p>
                      <p className="mt-0.5 text-[11px] text-auth-text-soft">{formatDateTime(feed.createdAt)}</p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-auth-text-soft">No campaign feed events yet.</p>
              )}
            </div>

            <div className="border-t border-auth-border px-5 py-3">
              <button
                type="button"
                onClick={() => navigate("/ngo/campaigns")}
                className="w-full rounded-lg bg-auth-bg px-3 py-2 text-xs font-semibold text-auth-text transition hover:bg-auth-border-subtle"
              >
                Open campaign operations
              </button>
            </div>
          </article>
        </section>

        <NGOTaskToastRegion toasts={toasts} onDismiss={dismissToast} />
      </section>
    </DashboardLayout>
  );
};

export default NgoDashboard;
