import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import adminSidebarItems from "./adminSidebarItems";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminDashboardCharts from "../../components/admin/AdminDashboardCharts";
import AdminToastRegion from "../../components/admin/AdminToastRegion";
import { fetchAdminDashboardRawData } from "../../services/adminDashboardService";

const DASHBOARD_FETCH_LIMIT = 250;

const HELP_REQUEST_STATUS_ORDER = [
  "pending",
  "verified",
  "assigned",
  "in-progress",
  "resolved",
  "rejected",
];

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

export default function AdminDashboard() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

    setError("");

    try {
      const response = await fetchAdminDashboardRawData({
        helpRequestParams: {
          page: 1,
          limit: DASHBOARD_FETCH_LIMIT,
        },
        ngoParams: {
          page: 1,
          limit: DASHBOARD_FETCH_LIMIT,
        },
      });

      setHelpRequests(Array.isArray(response.helpRequests) ? response.helpRequests : []);
      setNgos(Array.isArray(response.ngos) ? response.ngos : []);
      setLastUpdated(new Date());
      return response;
    } catch (loadError) {
      const message = loadError.message || "Unable to load admin dashboard data right now.";
      setError(message);
      addToast("error", "Dashboard load failed", message);
      throw loadError;
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
    try {
      await loadDashboardData({ showLoading: false });
      addToast("success", "Dashboard refreshed", "Latest metrics are now visible.");
    } catch {
      // Toast and inline error are already handled in loadDashboardData.
    }
  }, [addToast, loadDashboardData]);

  const helpRequestStats = useMemo(() => {
    return HELP_REQUEST_STATUS_ORDER.reduce((acc, status) => {
      acc[status] = helpRequests.filter((request) => request?.status === status).length;
      return acc;
    }, {
      total: helpRequests.length,
    });
  }, [helpRequests]);

  const ngoStats = useMemo(() => {
    return ngos.reduce((acc, ngo) => {
      const approvalStatus = ngo?.approvalStatus || "pending";
      acc.total += 1;

      if (approvalStatus === "pending") {
        acc.pending += 1;
      }

      if (approvalStatus === "approved") {
        acc.approved += 1;
      }

      if (approvalStatus === "rejected") {
        acc.rejected += 1;
      }

      return acc;
    }, {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    });
  }, [ngos]);

  const statusChartData = useMemo(() => {
    return HELP_REQUEST_STATUS_ORDER.map((status) => ({
      label: status.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      value: helpRequestStats[status] || 0,
    })).filter((entry) => entry.value > 0);
  }, [helpRequestStats]);

  const requestTrendData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayFrames = Array.from({ length: 7 }, (_, index) => {
      const frameDate = new Date(today);
      frameDate.setDate(today.getDate() - (6 - index));
      return {
        key: toDateKey(frameDate),
        label: frameDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });

    const counts = dayFrames.reduce((acc, frame) => {
      acc[frame.key] = 0;
      return acc;
    }, {});

    helpRequests.forEach((request) => {
      const date = toSafeDate(request?.createdAt);
      if (!date) {
        return;
      }

      const key = toDateKey(date);
      if (counts[key] !== undefined) {
        counts[key] += 1;
      }
    });

    return dayFrames.map((frame) => ({
      label: frame.label,
      total: counts[frame.key],
    }));
  }, [helpRequests]);

  const recentActivity = useMemo(() => {
    const pendingRequests = helpRequests
      .filter((request) => request?.status === "pending")
      .map((request) => ({
        id: `request-${request._id}`,
        type: "Pending Help Request",
        title: request?.name || "Unknown requester",
        meta: request?.location || "No location",
        status: request?.status || "pending",
        createdAt: request?.createdAt,
      }));

    const ngoRegistrations = ngos.map((ngo) => ({
      id: `ngo-${ngo._id}`,
      type: "NGO Registration",
      title: ngo?.organizationName || ngo?.registrationNumber || ngo?.userId?.name || "Unknown NGO",
      meta: ngo?.officialEmail || ngo?.userId?.email || "No official email",
      status: ngo?.approvalStatus || "pending",
      createdAt: ngo?.createdAt,
    }));

    return [...pendingRequests, ...ngoRegistrations]
      .sort((a, b) => {
        const aDate = toSafeDate(a.createdAt);
        const bDate = toSafeDate(b.createdAt);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 5);
  }, [helpRequests, ngos]);

  const statCards = useMemo(() => {
    return [
      {
        key: "total-requests",
        title: "Total Requests",
        value: helpRequestStats.total || 0,
        subtitle: "All fetched help requests",
        icon: ClipboardList,
        tone: "neutral",
      },
      {
        key: "pending-verification",
        title: "Pending Verification",
        value: helpRequestStats.pending || 0,
        subtitle: "Requests waiting for admin verification",
        icon: Clock3,
        tone: "warning",
      },
      {
        key: "resolved-requests",
        title: "Resolved Requests",
        value: helpRequestStats.resolved || 0,
        subtitle: "Requests marked as resolved",
        icon: CheckCircle2,
        tone: "success",
      },
      {
        key: "total-ngos",
        title: "Total NGOs",
        value: ngoStats.total,
        subtitle: "Registered NGO profiles",
        icon: Building2,
        tone: "neutral",
      },
      {
        key: "pending-ngo-approvals",
        title: "Pending NGO Approvals",
        value: ngoStats.pending,
        subtitle: "NGOs awaiting approval",
        icon: UserCheck,
        tone: "warning",
      },
    ];
  }, [helpRequestStats.pending, helpRequestStats.resolved, helpRequestStats.total, ngoStats.pending, ngoStats.total]);

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) {
      return "Not synced yet";
    }

    return lastUpdated.toLocaleString();
  }, [lastUpdated]);

  const renderRecentActivityTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 animate-pulse rounded-lg border border-auth-border bg-auth-border-subtle"
            />
          ))}
        </div>
      );
    }

    if (!recentActivity.length) {
      return (
        <div className="rounded-xl border border-auth-border bg-auth-bg p-8 text-center">
          <h3 className="text-lg font-semibold text-auth-text-strong">No recent activity</h3>
          <p className="mt-2 text-sm text-auth-text-soft">
            Recent pending help requests and NGO registrations will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-auth-border">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Type</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Name / Organization</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Context</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-auth-text-soft">Created</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((activity) => (
              <tr key={activity.id} className="border-b border-auth-border last:border-b-0">
                <td className="px-3 py-3 text-sm text-auth-text">{activity.type}</td>
                <td className="px-3 py-3 text-sm font-semibold text-auth-text-strong">{activity.title}</td>
                <td className="px-3 py-3 text-sm text-auth-text-soft">{activity.meta}</td>
                <td className="px-3 py-3 text-sm text-auth-text">{activity.status}</td>
                <td className="px-3 py-3 text-sm text-auth-text-soft">
                  {toSafeDate(activity.createdAt)?.toLocaleString() || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={adminSidebarItems}
      portalTitle="Admin Portal"
      avatarLetter="A"
      homePath="/admin-dashboard"
      searchPlaceholder="Search users, approvals, and platform controls..."
      contentClassName="bg-auth-bg"
    >
      <section className="space-y-5 rounded-2xl bg-auth-bg text-auth-text">
        <header className="rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-auth-border bg-auth-bg px-3 py-2 text-auth-text-soft">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-auth-text-soft">Admin Command Center</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-auth-text-strong">Dashboard Overview</h1>
                <p className="mt-2 text-sm text-auth-text-soft">
                  Aggregated insights from help requests and NGO profiles, calculated client-side from raw data.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-lg border border-auth-border bg-auth-bg px-3 py-2 text-xs text-auth-text-soft">
                Last updated: {lastUpdatedText}
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-auth-danger-border bg-auth-danger-bg px-4 py-3 text-sm text-auth-text">
              {error}
            </p>
          ) : null}
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <AdminStatCard
              key={card.key}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              tone={card.tone}
              isLoading={isLoading}
            />
          ))}
        </section>

        <AdminDashboardCharts
          statusData={statusChartData}
          trendData={requestTrendData}
          isLoading={isLoading}
        />

        <section className="rounded-2xl border border-auth-border bg-auth-surface p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-auth-text-strong">Recent Activity</h2>
            <p className="text-sm text-auth-text-soft">
              Five most recent pending help requests or NGO registrations.
            </p>
          </div>

          {renderRecentActivityTable()}
        </section>
      </section>

      <AdminToastRegion toasts={toasts} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}
